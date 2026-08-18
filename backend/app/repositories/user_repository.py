"""
User repository: isolates raw DB queries from business logic (services).
"""

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, user_in: UserCreate, is_admin: bool = False) -> User:
        user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=hash_password(user_in.password),
            is_admin=is_admin,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def count_users(self) -> int:
        return self.db.query(User).count()

    def list_all(self) -> list[User]:
        return self.db.query(User).all()

    def update_admin_role(self, user: User, is_admin: bool) -> User:
        user.is_admin = is_admin
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()

