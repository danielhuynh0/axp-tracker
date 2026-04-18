from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Category
from schemas import CategoryRead

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.order).all()
