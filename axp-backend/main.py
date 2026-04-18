from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from seed import seed_categories
from routers import categories, projects, tasks, weekly_entries
from routers.summary import router as summary_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AXP Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(weekly_entries.router)
app.include_router(summary_router)


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
