from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from database import get_db
from models import Task, WeeklyEntry, HourAllocation
from schemas import WeeklyEntryUpsert, WeeklyEntryRead, HourAllocationRead
from hours import distribute_hours

router = APIRouter(tags=["weekly_entries"])


def _build_response(entry: WeeklyEntry) -> WeeklyEntryRead:
    allocations = [
        HourAllocationRead(
            category_id=a.category_id,
            category_name=a.category.name,
            hours=a.hours,
        )
        for a in sorted(entry.hour_allocations, key=lambda a: a.category.order)
    ]
    return WeeklyEntryRead(
        id=entry.id,
        task_id=entry.task_id,
        week_start_date=entry.week_start_date,
        total_hours=entry.total_hours,
        allocations=allocations,
    )


@router.get("/tasks/{task_id}/weekly-entries", response_model=list[WeeklyEntryRead])
def list_weekly_entries(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    entries = (
        db.query(WeeklyEntry)
        .filter(WeeklyEntry.task_id == task_id)
        .order_by(WeeklyEntry.week_start_date.desc())
        .all()
    )
    return [_build_response(e) for e in entries]


@router.get(
    "/tasks/{task_id}/weekly-entries/{week_start_date}", response_model=WeeklyEntryRead
)
def get_weekly_entry(task_id: int, week_start_date: date, db: Session = Depends(get_db)):
    entry = (
        db.query(WeeklyEntry)
        .filter(
            WeeklyEntry.task_id == task_id,
            WeeklyEntry.week_start_date == week_start_date,
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return _build_response(entry)


@router.put(
    "/tasks/{task_id}/weekly-entries/{week_start_date}",
    response_model=WeeklyEntryRead,
    status_code=200,
)
def upsert_weekly_entry(
    task_id: int,
    week_start_date: date,
    body: WeeklyEntryUpsert,
    db: Session = Depends(get_db),
):
    if week_start_date.weekday() != 0:
        raise HTTPException(status_code=422, detail="week_start_date must be a Monday")

    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    weights = {w.category_id: w.weight for w in task.category_weights}
    if not any(v > 0 for v in weights.values()):
        raise HTTPException(
            status_code=422,
            detail="Task has no category weights configured. Set weights before logging hours.",
        )

    allocation_map = distribute_hours(body.total_hours, weights)

    entry = (
        db.query(WeeklyEntry)
        .filter(
            WeeklyEntry.task_id == task_id,
            WeeklyEntry.week_start_date == week_start_date,
        )
        .first()
    )

    if entry:
        entry.total_hours = body.total_hours
        for a in entry.hour_allocations:
            db.delete(a)
        db.flush()
    else:
        entry = WeeklyEntry(
            task_id=task_id,
            week_start_date=week_start_date,
            total_hours=body.total_hours,
        )
        db.add(entry)
        db.flush()

    for category_id, hours in allocation_map.items():
        db.add(
            HourAllocation(
                weekly_entry_id=entry.id,
                category_id=category_id,
                hours=hours,
            )
        )

    db.commit()
    db.refresh(entry)
    return _build_response(entry)
