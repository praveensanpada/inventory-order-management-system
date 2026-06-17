from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import time

from app.api.v1.router import api_router, assessment_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.database.session import SessionLocal, engine
from app.middlewares.exceptions import register_exception_handlers
from app.services.auth_service import ensure_admin_user

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    db = SessionLocal()
    try:
        ensure_admin_user(db, settings.admin_email, settings.admin_password)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)


@app.middleware("http")
async def request_logger(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    logger.info("%s %s %s %.3fs", request.method, request.url.path, response.status_code, time.perf_counter() - started)
    return response


@app.get("/health")
def health():
    return {"success": True, "message": "Backend is healthy", "data": {"app": settings.app_name}}


@app.get("/ready")
def ready():
    with engine.connect() as connection:
        connection.exec_driver_sql("SELECT 1")
    return {"success": True, "message": "Backend is ready", "data": {"database": "connected"}}


app.include_router(api_router)
app.include_router(assessment_router)
