from sqlalchemy.orm import Session
from models import Category

CATEGORIES = [
    {"name": "Practice Management", "order": 1},
    {"name": "Project Management", "order": 2},
    {"name": "Programming and Analysis", "order": 3},
    {"name": "PP&D", "order": 4},
    {"name": "PD&D", "order": 5},
    {"name": "Construction and Evaluation", "order": 6},
]


def seed_categories(db: Session) -> None:
    existing = {c.name for c in db.query(Category).all()}
    for item in CATEGORIES:
        if item["name"] not in existing:
            db.add(Category(name=item["name"], order=item["order"]))
    db.commit()
