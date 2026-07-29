# AI Document Intelligence Platform — Phase 1

**Status:** Phase 1 of 6 — Backend core (auth, database, Docker). ✅ Tested, working.

This phase gives you a real, running FastAPI backend with:
- User registration & login (bcrypt password hashing)
- JWT-based authentication (`/api/me` is a protected route)
- SQLite persistence via SQLAlchemy
- Rate limiting middleware
- CORS configured for a future React frontend
- Full pytest suite (7/7 passing)
- Dockerfile + docker-compose (one-command startup)

Document upload, the RAG pipeline, the frontend, and admin/analytics come in Phases 2–6.

## Folder structure so far

```
ragapp/
├── docker-compose.yml
├── README.md
└── backend/
    ├── Dockerfile
    ├── .dockerignore
    ├── .env.example
    ├── requirements.txt
    ├── app/
    │   ├── main.py                  # FastAPI app factory
    │   ├── core/
    │   │   ├── config.py            # env-driven settings
    │   │   └── security.py          # bcrypt + JWT helpers
    │   ├── database/
    │   │   └── session.py           # SQLAlchemy engine/session
    │   ├── models/
    │   │   └── user.py              # User ORM model
    │   ├── schemas/
    │   │   └── user.py              # Pydantic request/response models
    │   ├── repositories/
    │   │   └── user_repository.py   # DB access layer
    │   ├── services/
    │   │   └── auth_service.py      # business logic
    │   ├── api/
    │   │   ├── deps.py              # get_current_user, get_current_admin
    │   │   └── auth.py              # /register /login /me
    │   ├── middleware/
    │   │   └── rate_limit.py
    │   └── rag/, utils/             # reserved for Phase 2/3
    └── tests/
        ├── conftest.py
        └── test_auth.py
```

## Run locally (without Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and set a real SECRET_KEY, e.g.:
python -c "import secrets; print(secrets.token_hex(32))"

uvicorn app.main:app --reload
```

API docs: http://localhost:8000/api/docs

## Run with Docker

```bash
cd backend && cp .env.example .env   # edit SECRET_KEY first
cd ..
docker compose up --build
```

Backend will be available at http://localhost:8000.

## Run tests

```bash
cd backend
SECRET_KEY=test-secret python -m pytest tests/ -v
```

Expected: `7 passed`.

## Try it (curl)

```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","full_name":"You","password":"supersecret123"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"supersecret123"}'

# Use the returned access_token
curl http://localhost:8000/api/me -H "Authorization: Bearer <access_token>"
```

## LLM provider

Default is **OpenAI** (`LLM_PROVIDER=openai` in `.env`, plus `OPENAI_API_KEY`). The RAG
pipeline in Phase 3 will be built behind a small provider interface so `LLM_PROVIDER=ollama`
can be switched on later with no other code changes, once a local Ollama server is available.

## What's next (Phase 2)

- POST `/api/upload` (PDF/DOCX/TXT), file validation (size, duplicate, type)
- Text extraction with page numbers (PyMuPDF/pdfplumber/python-docx)
- Chunking + sentence-transformers embeddings + FAISS index
- Document metadata stored in SQLite, linked to the uploading user
