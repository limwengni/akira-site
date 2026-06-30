import os

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers.characters import router as characters_router
from .routers.storage import router as storage_router

settings = get_settings()

app = FastAPI(
    title="Akira Site API",
    version="0.1.0",
    description="Backend API for character management, voting, and future chat features.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = os.getenv("API_PREFIX", "")

app.include_router(characters_router, prefix=API_PREFIX)
app.include_router(storage_router, prefix=API_PREFIX)

router = APIRouter(prefix=API_PREFIX)


@router.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Akira Site API is running."}


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(router)
