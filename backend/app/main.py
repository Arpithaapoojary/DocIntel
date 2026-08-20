"""
Application entry point.

Phase 1 scope: health check + authentication (register/login/me) wired up
end-to-end with SQLite, JWT, and bcrypt. Document upload and the RAG
pipeline are added in later phases and will plug into this same app.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin as admin_router
from app.api import auth as auth_router
from app.api import dashboard as dashboard_router
from app.api import documents as documents_router
from app.api import qa as qa_router
from app.api import search as search_router
from app.core.config import settings
from app.core.security import hash_password
from app.database.session import Base, engine, SessionLocal
from app.middleware.rate_limit import RateLimitMiddleware

# Import models so SQLAlchemy metadata knows about them before create_all.
from app.models import user, document, chat_message  # noqa: F401
from app.models.user import User


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Seed and guarantee the single designated Admin account
    with SessionLocal() as db:
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                full_name="System Administrator",
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                is_admin=True,
            )
            db.add(admin_user)
            db.commit()
        else:
            admin_user.is_admin = True
            # Update password if needed
            admin_user.hashed_password = hash_password(settings.ADMIN_PASSWORD)
            db.commit()

        # Demote all other users to ensure strictly only 1 admin exists
        other_admins = db.query(User).filter(User.email != settings.ADMIN_EMAIL, User.is_admin == True).all()
        for u in other_admins:
            u.is_admin = False
        if other_admins:
            db.commit()

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
    app.include_router(dashboard_router.router, prefix="/api")
    app.include_router(search_router.router, prefix="/api")
    app.include_router(admin_router.router, prefix="/api")

    @app.get("/api/health", tags=["System"])
    def health_check():
        return {"status": "ok", "environment": settings.ENVIRONMENT}

    return app


app = create_app()
