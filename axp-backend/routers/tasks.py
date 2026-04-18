from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Project, Task, TaskCategoryWeight, Category
from schemas import (
    TaskCreate,
    TaskUpdate,
    TaskRead,
    CategoryWeightInput,
    TaskCategoryWeightRead,
)

router = APIRouter(tags=["tasks"])


@router.get("/projects/{project_id}/tasks", response_model=list[TaskRead])
def list_tasks(project_id: int, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.query(Task).filter(Task.project_id == project_id).order_by(Task.id).all()


@router.post("/projects/{project_id}/tasks", response_model=TaskRead, status_code=201)
def create_task(project_id: int, body: TaskCreate, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    task = Task(project_id=project_id, name=body.name, description=body.description)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(task_id: int, body: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if body.name is not None:
        task.name = body.name
    if body.description is not None:
        task.description = body.description
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


@router.get("/tasks/{task_id}/weights", response_model=list[TaskCategoryWeightRead])
def get_weights(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    categories = db.query(Category).order_by(Category.order).all()
    weight_map = {w.category_id: w.weight for w in task.category_weights}

    return [
        TaskCategoryWeightRead(
            category_id=cat.id,
            category_name=cat.name,
            weight=weight_map.get(cat.id, 0.0),
        )
        for cat in categories
    ]


@router.put("/tasks/{task_id}/weights", response_model=list[TaskCategoryWeightRead])
def set_weights(
    task_id: int, body: list[CategoryWeightInput], db: Session = Depends(get_db)
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if any(w.weight < 0 for w in body):
        raise HTTPException(status_code=422, detail="Weights must be non-negative")

    existing = {w.category_id: w for w in task.category_weights}

    for item in body:
        if item.category_id in existing:
            existing[item.category_id].weight = item.weight
        else:
            db.add(
                TaskCategoryWeight(
                    task_id=task_id,
                    category_id=item.category_id,
                    weight=item.weight,
                )
            )

    db.commit()
    db.refresh(task)

    categories = db.query(Category).order_by(Category.order).all()
    weight_map = {w.category_id: w.weight for w in task.category_weights}

    return [
        TaskCategoryWeightRead(
            category_id=cat.id,
            category_name=cat.name,
            weight=weight_map.get(cat.id, 0.0),
        )
        for cat in categories
    ]
