from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Category, HourAllocation, WeeklyEntry, Task, Project

router = APIRouter(tags=["summary"])


class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    order: int
    total_hours: float


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
