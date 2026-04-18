from datetime import date
from pydantic import BaseModel, field_validator


class CategoryRead(BaseModel):
    id: int
    name: str
    order: int

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class ProjectRead(BaseModel):
    id: int
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    name: str
    description: str | None = None


class TaskUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CategoryWeightInput(BaseModel):
    category_id: int
    weight: float


class TaskRead(BaseModel):
    id: int
    project_id: int
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class TaskCategoryWeightRead(BaseModel):
    category_id: int
    category_name: str
    weight: float

    model_config = {"from_attributes": True}


class HourAllocationRead(BaseModel):
    category_id: int
    category_name: str
    hours: float

    model_config = {"from_attributes": True}


class WeeklyEntryUpsert(BaseModel):
    week_start_date: date
    total_hours: float

    @field_validator("total_hours")
    @classmethod
    def must_be_quarter_increment(cls, v: float) -> float:
        if abs(round(v * 4) - v * 4) > 1e-9:
            raise ValueError("total_hours must be a multiple of 0.25")
        if v <= 0:
            raise ValueError("total_hours must be positive")
        return v

    @field_validator("week_start_date")
    @classmethod
    def must_be_monday(cls, v: date) -> date:
        if v.weekday() != 0:
            raise ValueError("week_start_date must be a Monday")
        return v


class WeeklyEntryRead(BaseModel):
    id: int
    task_id: int
    week_start_date: date
    total_hours: float
    allocations: list[HourAllocationRead] = []

    model_config = {"from_attributes": True}
