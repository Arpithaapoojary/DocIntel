"""
Lightweight in-memory rate limiting middleware.

Note: this is per-process/in-memory, which is fine for a single backend
container. For multi-instance deployments, back this with Redis instead.
"""

import time
from collections import defaultdict, deque

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.window_seconds = 60
        self.limit = settings.RATE_LIMIT_PER_MINUTE
        self.hits: dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window = self.hits[client_ip]

        while window and window[0] <= now - self.window_seconds:
            window.popleft()

        if len(window) >= self.limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please slow down and try again shortly."},
            )

        window.append(now)
        return await call_next(request)
