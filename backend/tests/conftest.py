import os
import shutil
import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("RATE_LIMIT_PER_MINUTE", "100000")

from app.database.session import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.rag.embeddings.dependency import get_embedder  # noqa: E402
from app.rag.llm.dependency import get_llm_client  # noqa: E402
from app.rag.vector_store.dependency import get_vector_store  # noqa: E402
from app.rag.vector_store.faiss_store import FaissStore  # noqa: E402
from tests.fakes import FAKE_DIMENSION, FakeEmbedder, FakeLLMClient  # noqa: E402


@pytest.fixture()
def client():
    test_db_fd, test_db_path = tempfile.mkstemp(suffix=".db")
    engine = create_engine(
        f"sqlite:///{test_db_path}", connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    vector_dir = tempfile.mkdtemp()
    upload_dir = tempfile.mkdtemp()
    test_store = FaissStore(dimension=FAKE_DIMENSION, persist_dir=vector_dir)
    test_embedder = FakeEmbedder()
    test_llm_client = FakeLLMClient()

    from app.core.config import settings as app_settings

    original_upload_dir = app_settings.UPLOAD_DIR
    app_settings.UPLOAD_DIR = upload_dir

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_embedder] = lambda: test_embedder
    app.dependency_overrides[get_vector_store] = lambda: test_store
    app.dependency_overrides[get_llm_client] = lambda: test_llm_client

    with TestClient(app) as c:
        yield c

    app_settings.UPLOAD_DIR = original_upload_dir
    shutil.rmtree(vector_dir, ignore_errors=True)
    shutil.rmtree(upload_dir, ignore_errors=True)

    app.dependency_overrides.clear()

    # On Windows, SQLite keeps a file lock until every connection is closed.
    # Disposing the engine releases the OS-level handle so the temp file
    # can actually be deleted afterward.
    engine.dispose()
    os.close(test_db_fd)
    try:
        os.remove(test_db_path)
    except PermissionError:
        # Extremely rare residual lock (e.g. antivirus scan) — not worth
        # failing the test run over a temp file that the OS will clean up.
        pass
