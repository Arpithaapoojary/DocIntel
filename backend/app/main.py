"""
Application entry point.

Phase 1 scope: health check + authentication (register/login/me) wired up
end-to-end with SQLite, JWT, and bcrypt. Document upload and the RAG
pipeline are added in later phases and will plug into this same app.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth as auth_router
from app.api import documents as documents_router
from app.api import qa as qa_router
from app.core.config import settings
from app.database.session import Base, engine
from app.middleware.rate_limit import RateLimitMiddleware

# Import models so SQLAlchemy metadata knows about them before create_all.
from app.models import user, document, chat_message  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Phase 1 uses create_all for simplicity. Swap for Alembic migrations
    # once the schema stabilizes across later phases.
    Base.metadata.create_all(bind=engine)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="RAG-powered document Q&A assistant API",
        version="0.1.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimitMiddleware)

    app.include_router(auth_router.router, prefix="/api")
    app.include_router(documents_router.router, prefix="/api")
    app.include_router(qa_router.router, prefix="/api")

    @app.get("/api/health", tags=["System"])
    def health_check():
        return {"status": "ok", "environment": settings.ENVIRONMENT}

    return app


app = create_app()
