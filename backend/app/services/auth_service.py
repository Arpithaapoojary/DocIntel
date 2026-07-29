"""
Authentication service: orchestrates registration and login using the
UserRepository, and issues JWT tokens on successful login.
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserLogin, Token, UserOut


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, user_in: UserCreate) -> UserOut:
        existing = self.repo.get_by_email(user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )
        user = self.repo.create(user_in)
        return UserOut.model_validate(user)

    def login(self, credentials: UserLogin) -> Token:
        user = self.repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been disabled.",
            )
        token = create_access_token(subject=user.id, extra_claims={"is_admin": user.is_admin})
        return Token(access_token=token, user=UserOut.model_validate(user))
