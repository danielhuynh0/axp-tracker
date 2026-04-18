from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    order = Column(Integer, nullable=False, default=0)

    task_weights = relationship("TaskCategoryWeight", back_populates="category")
    hour_allocations = relationship("HourAllocation", back_populates="category")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    project = relationship("Project", back_populates="tasks")
    category_weights = relationship(
        "TaskCategoryWeight", back_populates="task", cascade="all, delete-orphan"
    )
    weekly_entries = relationship(
        "WeeklyEntry", back_populates="task", cascade="all, delete-orphan"
    )


class TaskCategoryWeight(Base):
    __tablename__ = "task_category_weights"
    __table_args__ = (UniqueConstraint("task_id", "category_id"),)

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    weight = Column(Float, nullable=False, default=0.0)

    task = relationship("Task", back_populates="category_weights")
    category = relationship("Category", back_populates="task_weights")


class WeeklyEntry(Base):
    __tablename__ = "weekly_entries"
    __table_args__ = (UniqueConstraint("task_id", "week_start_date"),)

    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    week_start_date = Column(Date, nullable=False)
    total_hours = Column(Float, nullable=False)

    task = relationship("Task", back_populates="weekly_entries")
    hour_allocations = relationship(
        "HourAllocation", back_populates="weekly_entry", cascade="all, delete-orphan"
    )


class HourAllocation(Base):
    __tablename__ = "hour_allocations"

    id = Column(Integer, primary_key=True)
    weekly_entry_id = Column(Integer, ForeignKey("weekly_entries.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    hours = Column(Float, nullable=False)

    weekly_entry = relationship("WeeklyEntry", back_populates="hour_allocations")
    category = relationship("Category", back_populates="hour_allocations")
