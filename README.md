# AI Document Intelligence Platform — Phase 5

**Status:** Phase 5 of 6 — React frontend. ✅ Backend still 50/50 tests passing; frontend builds clean
(0 TypeScript errors, 0 lint errors).


Phases 1–4 built the backend. **Phase 5 adds the actual UI** — a React app you open in a browser
instead of curl commands or the `/api/docs` page.

## Frontend stack

- React 19 + TypeScript + Vite
- Tailwind CSS (hand-authored components in the app's own design language, not the shadcn CLI —
  see note below)
- React Router for navigation, Axios for API calls, lucide-react for icons

## Design language

The interface is built around a "library card-catalog" motif: every cited source in an answer
renders as an **index tab** (`.citation-tab` in `index.css`) — a small styled tag with the
document name and page number, in the spirit of the physical citation cards this kind of tool is
digitally replacing. Typography pairs a serif display face (Fraunces) for headings with Inter for
body text and IBM Plex Mono for anything numeric or structural (confidence scores, page numbers,
timestamps) — reinforcing "this is a precision research tool," not a generic SaaS chat template.
Dark mode is built in via Tailwind's `class` strategy, toggleable from the sidebar.

## Pages

- **Login / Register** — the first account ever registered becomes the workspace admin (see Phase 4)
- **Dashboard** — document count, questions asked, storage used, recent activity
- **Documents** — drag-and-drop upload with a live progress bar, list with status badges, delete
- **Ask** — the chat interface: question/answer bubbles, citation index-tabs under every answer,
  a confidence meter, copy/regenerate/download-conversation/clear-history controls
- **Search** — semantic/keyword toggle, upload-date filters, results as passage cards (no LLM call)
- **Admin** (only visible to admins) — platform-wide stats, user list with document/question
  counts, delete-user (with a confirmation dialog warning about cascading deletes)

**A note on the tech stack:** the spec mentioned Shadcn UI specifically. I hand-built a small set
of Tailwind-based primitives (`Button`, `Card`, `Field`, `Badge`, `Skeleton`, `EmptyState`) in the
app's own design language instead of pulling in the Shadcn CLI — this keeps every component
consistent with the citation/index-tab motif rather than mixing two different visual systems. If
you want actual Shadcn components wired in later (e.g. for their more complex primitives like
comboboxes or dialogs), that's a straightforward addition on top of what's here.

Backend recap (Phases 1–4): authentication, document upload/processing, a full RAG Q&A pipeline
with citations and hallucination prevention, plus a dashboard, search, and admin panel — all
covered in detail further down this README and fully tested (50/50 backend tests passing).

**Admin bootstrap reminder:** there's intentionally no "promote to admin" endpoint (that would
let any authenticated user grant themselves admin rights). Instead, **the first user who ever
registers on a fresh database automatically becomes an admin.** Register your own account first,
before sharing the app with anyone else, or you won't see the Admin tab.

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
    │   │   ├── user.py              # User ORM model
    │   │   ├── document.py          # Document ORM model
    │   │   └── chat_message.py      # ChatMessage ORM model (Q&A history)
    │   ├── schemas/
    │   │   ├── user.py              # Pydantic request/response models
    │   │   ├── document.py
    │   │   └── chat.py              # AskRequest/AskResponse/SourceOut/ChatMessageOut
    │   ├── repositories/
    │   │   ├── user_repository.py   # DB access layer
    │   │   ├── document_repository.py
    │   │   └── chat_history_repository.py
    │   ├── services/
    │   │   ├── auth_service.py      # business logic
    │   │   ├── document_service.py  # upload -> extract -> chunk -> embed -> store
    │   │   ├── qa_service.py        # the RAG pipeline itself
    │   │   ├── dashboard_service.py
    │   │   ├── search_service.py
    │   │   └── admin_service.py     # user mgmt with cascading deletes, analytics
    │   ├── api/
    │   │   ├── deps.py              # get_current_user, get_current_admin
    │   │   ├── auth.py              # /register /login /me
    │   │   ├── documents.py         # /upload /documents /document/{id}
    │   │   ├── qa.py                # /ask /history
    │   │   ├── dashboard.py         # /dashboard
    │   │   ├── search.py            # /search
    │   │   └── admin.py             # /admin/users /admin/documents /admin/analytics
    │   ├── middleware/
    │   │   └── rate_limit.py
    │   ├── rag/
    │   │   ├── document_processing/
    │   │   │   ├── extractors.py    # PDF/DOCX/TXT → (page_number, text)
    │   │   │   └── chunker.py       # text → overlapping chunks
    │   │   ├── embeddings/
    │   │   │   ├── base.py                          # abstract interface
    │   │   │   ├── sentence_transformer_embedder.py # real implementation
    │   │   │   └── dependency.py                    # FastAPI DI (overridable in tests)
    │   │   ├── vector_store/
    │   │   │   ├── faiss_store.py    # add/search/delete, persisted to disk
    │   │   │   └── dependency.py
    │   │   ├── llm/
    │   │   │   ├── base.py                # abstract interface
    │   │   │   ├── openai_client.py       # real implementation
    │   │   │   └── dependency.py          # FastAPI DI (overridable in tests)
    │   │   └── prompts/
    │   │       └── qa_prompt.py           # grounded-answer system/user prompts
    │   └── utils/
    │       └── validators.py         # extension/size/duplicate checks
    └── tests/
        ├── conftest.py               # DB + fake embedder + fake LLM + temp vector store fixtures
        ├── fakes.py                  # deterministic fakes (no network needed)
        ├── test_auth.py
        ├── test_documents.py         # upload/list/delete + isolation + validation
        ├── test_qa.py                # retrieval, citations, confidence, fallback, history
        ├── test_dashboard.py
        ├── test_search.py            # semantic + keyword + filters + isolation
        └── test_admin.py             # bootstrap, authorization, cascading delete, analytics
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── .dockerignore
    ├── .env.example
    ├── package.json
    ├── index.html
    ├── tailwind.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx                   # routes + auth/admin guards
        ├── index.css                 # design tokens, .citation-tab signature element
        ├── types/index.ts            # mirrors the backend's Pydantic schemas
        ├── lib/api.ts                # Axios client, auth token handling, all API calls
        ├── contexts/
        │   ├── AuthContext.tsx
        │   └── ToastContext.tsx
        ├── components/
        │   ├── ui/                   # Button, Field, Card, Badge, Skeleton, EmptyState
        │   ├── layout/                # Sidebar, AppLayout
        │   ├── CitationTabs.tsx      # the signature citation index-tab element
        │   └── ConfidenceMeter.tsx
        └── pages/
            ├── LoginPage.tsx / RegisterPage.tsx
            ├── DashboardPage.tsx
            ├── DocumentsPage.tsx
            ├── ChatPage.tsx
            ├── SearchPage.tsx
            └── AdminPage.tsx
```

## Run locally (without Docker)

**Backend:**
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

**Frontend** (in a second terminal):
```bash
cd frontend
npm install
cp .env.example .env   # default already points at http://localhost:8000/api
npm run dev
```
App: http://localhost:5173

## Run with Docker (both services)

```bash
cd backend && cp .env.example .env   # edit SECRET_KEY first
cd ..
docker compose up --build
```

Backend will be available at http://localhost:8000, frontend at http://localhost:5173.

## Run tests

```bash
cd backend
python -m pytest tests/ -v
```
(Windows PowerShell: no need to prefix `SECRET_KEY=...` anymore — `conftest.py` sets a
default automatically. If you're on Mac/Linux you can still do
`SECRET_KEY=test-secret python -m pytest tests/ -v`.)

Expected: `50 passed`. Tests use fast, deterministic fakes (see `tests/fakes.py`) for both the
embedder and the LLM client, so the suite runs in under 35 seconds and never touches the
network or costs any API credits.

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

# Save the access_token from the login response, then:

# Upload a document
curl -X POST http://localhost:8000/api/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/your/document.pdf"

# Ask a question about your uploaded documents
curl -X POST http://localhost:8000/api/ask \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"question":"What does this document say about Docker?"}'

# View chat history
curl http://localhost:8000/api/history -H "Authorization: Bearer <access_token>"

# Clear chat history
curl -X DELETE http://localhost:8000/api/history -H "Authorization: Bearer <access_token>"

# List your documents
curl http://localhost:8000/api/documents -H "Authorization: Bearer <access_token>"

# Delete a document
curl -X DELETE http://localhost:8000/api/document/<document_id> \
  -H "Authorization: Bearer <access_token>"

# Dashboard summary
curl http://localhost:8000/api/dashboard -H "Authorization: Bearer <access_token>"

# Semantic search (no LLM call, just retrieval)
curl -X POST http://localhost:8000/api/search \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"Docker containers","mode":"semantic"}'

# Keyword search with a date filter
curl -X POST http://localhost:8000/api/search \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"query":"revenue","mode":"keyword","uploaded_after":"2026-01-01"}'

# Admin: list all users (requires the FIRST registered account — see note above)
curl http://localhost:8000/api/admin/users -H "Authorization: Bearer <admin_access_token>"

# Admin: platform-wide analytics
curl http://localhost:8000/api/admin/analytics -H "Authorization: Bearer <admin_access_token>"
```

**First upload will be slow** — `sentence-transformers` downloads the embedding model
(~90MB, one-time, needs internet) the first time it's used, then caches it locally.
Every upload after that is fast. **`/ask` requires `OPENAI_API_KEY` to be set in `.env`** —
without it you'll get a clear 500 error explaining exactly what's missing, not a silent failure.

## LLM provider

Default and only fully working option right now is **OpenAI** (`LLM_PROVIDER=openai` in
`.env`, plus a real `OPENAI_API_KEY`). `LLM_PROVIDER=ollama` is reserved and will return a
clear "not implemented yet" error if selected — it's wired into the same `BaseLLMClient`
interface so swapping it in later won't touch the QA service, prompts, or retrieval logic.

## What's next (Phase 6)

- More thorough automated tests (frontend component/integration tests; backend edge cases)
- GitHub Actions CI/CD: run tests + build Docker images on every push
- Deployment guide for Render/Railway/AWS EC2, plus a live demo URL
- Sequence/architecture diagrams and a polished top-level README with badges and screenshots
