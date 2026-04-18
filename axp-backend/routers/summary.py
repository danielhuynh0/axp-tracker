from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from database import get_db
from models import Category, HourAllocation, WeeklyEntry, Task, Project

router = APIRouter(tags=["summary"])


class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    order: int
    total_hours: float


class HistoryAllocation(BaseModel):
    category_id: int
    category_name: str
    hours: float


class HistoryEntry(BaseModel):
    id: int
    week_start_date: date
    total_hours: float
    task_id: int
    task_name: str
    project_id: int
    project_name: str
    allocations: list[HistoryAllocation]


def _all_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.order).all()


def _hours_map(rows: list) -> dict[int, float]:
    return {row.category_id: float(row.total_hours) for row in rows}


@router.get("/summary", response_model=list[CategorySummary])
def global_summary(db: Session = Depends(get_db)):
    rows = (
        db.query(
            HourAllocation.category_id,
            func.sum(HourAllocation.hours).label("total_hours"),
        )
        .group_by(HourAllocation.category_id)
        .all()
    )
    hours = _hours_map(rows)
    return [
        CategorySummary(
            category_id=c.id,
            category_name=c.name,
            order=c.order,
            total_hours=hours.get(c.id, 0.0),
        )
        for c in _all_categories(db)
    ]


@router.get("/projects/{project_id}/summary", response_model=list[CategorySummary])
def project_summary(project_id: int, db: Session = Depends(get_db)):
    if not db.get(Project, project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    rows = (
        db.query(
            HourAllocation.category_id,
            func.sum(HourAllocation.hours).label("total_hours"),
        )
        .join(WeeklyEntry, HourAllocation.weekly_entry_id == WeeklyEntry.id)
        .join(Task, WeeklyEntry.task_id == Task.id)
        .filter(Task.project_id == project_id)
        .group_by(HourAllocation.category_id)
        .all()
    )
    hours = _hours_map(rows)
    return [
        CategorySummary(
            category_id=c.id,
            category_name=c.name,
            order=c.order,
            total_hours=hours.get(c.id, 0.0),
        )
        for c in _all_categories(db)
    ]


@router.get("/history", response_model=list[HistoryEntry])
def get_history(db: Session = Depends(get_db)):
    entries = (
        db.query(WeeklyEntry)
        .options(
            joinedload(WeeklyEntry.hour_allocations).joinedload(HourAllocation.category),
            joinedload(WeeklyEntry.task).joinedload(Task.project),
        )
        .order_by(WeeklyEntry.week_start_date.desc())
        .all()
    )
    return [
        HistoryEntry(
            id=e.id,
            week_start_date=e.week_start_date,
            total_hours=e.total_hours,
            task_id=e.task.id,
            task_name=e.task.name,
            project_id=e.task.project.id,
            project_name=e.task.project.name,
            allocations=[
                HistoryAllocation(
                    category_id=a.category_id,
                    category_name=a.category.name,
                    hours=a.hours,
                )
                for a in sorted(e.hour_allocations, key=lambda a: a.category.order)
            ],
        )
        for e in entries
    ]
