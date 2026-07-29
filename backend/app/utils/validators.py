"""
Upload validation helpers.
"""

import os
from fastapi import HTTPException, status

from app.core.config import settings


def validate_extension(filename: str) -> str:
    """Return the lowercase extension if allowed, else raise 400."""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )
    return ext


def validate_size(size_bytes: int) -> None:
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({size_bytes / (1024*1024):.1f}MB). "
            f"Maximum allowed is {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )
    if size_bytes == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")


def validate_not_duplicate(existing_filenames: list[str], filename: str) -> None:
    if filename in existing_filenames:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A document named '{filename}' already exists. Rename the file or delete the existing one first.",
        )
