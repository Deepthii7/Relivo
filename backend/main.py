from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import ALLOWED_ORIGINS, UPLOAD_DIR
from database.connection import engine, initialize_database
from routers import analytics, auth, requests, resources


initialize_database()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(_app):
    yield
    engine.dispose()


app = FastAPI(title="RELIVO API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth.router)
app.include_router(resources.router)
app.include_router(requests.router)
app.include_router(analytics.router)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def root():
    return {"message": "RELIVO API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}