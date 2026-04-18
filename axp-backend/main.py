from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from seed import seed_categories

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AXP Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_categories(db)
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "AXP Tracker API"}
