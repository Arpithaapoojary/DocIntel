import io

import docx
import fitz
import pytest


def _register_and_login(client, email="uploader@example.com"):
    client.post(
        "/api/register",
        json={"email": email, "full_name": "Uploader", "password": "supersecret123"},
    )
    resp = client.post("/api/login", json={"email": email, "password": "supersecret123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _make_txt_bytes(content: str) -> bytes:
    return content.encode("utf-8")


def _make_docx_bytes(content: str) -> bytes:
    document = docx.Document()
    document.add_paragraph(content)
    buf = io.BytesIO()
    document.save(buf)
    buf.seek(0)
    return buf.read()


def _make_pdf_bytes(pages_text: list[str]) -> bytes:
    pdf = fitz.open()
    for text in pages_text:
        page = pdf.new_page()
        page.insert_text((72, 72), text)
    buf = pdf.tobytes()
    pdf.close()
    return buf


def test_upload_txt_document(client):
    headers = _register_and_login(client, "txtuser@example.com")
    content = _make_txt_bytes("This is a simple test document about docker containers and RAG.")

    resp = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("notes.txt", content, "text/plain")},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["original_filename"] == "notes.txt"
    assert body["status"] == "ready"
    assert body["page_count"] == 1
    assert body["chunk_count"] >= 1


def test_upload_docx_document(client):
    headers = _register_and_login(client, "docxuser@example.com")
    content = _make_docx_bytes("Docker isolates applications using containers.")

    resp = client.post(
        "/api/upload",
        headers=headers,
        files={
            "file": (
                "guide.docx",
                content,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["status"] == "ready"
    assert body["chunk_count"] >= 1


def test_upload_pdf_document_preserves_pages(client):
    headers = _register_and_login(client, "pdfuser@example.com")
    content = _make_pdf_bytes(["Page one content about FastAPI.", "Page two content about FAISS."])

    resp = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("doc.pdf", content, "application/pdf")},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["page_count"] == 2
    assert body["chunk_count"] >= 2


def test_upload_rejects_invalid_extension(client):
    headers = _register_and_login(client, "badext@example.com")
    resp = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("virus.exe", b"not a real file", "application/octet-stream")},
    )
    assert resp.status_code == 400
    assert "Unsupported file type" in resp.json()["detail"]


def test_upload_rejects_empty_file(client):
    headers = _register_and_login(client, "emptyfile@example.com")
    resp = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("empty.txt", b"", "text/plain")},
    )
    assert resp.status_code == 400


def test_upload_rejects_duplicate_filename(client):
    headers = _register_and_login(client, "dupefile@example.com")
    content = _make_txt_bytes("First upload.")

    first = client.post(
        "/api/upload", headers=headers, files={"file": ("dupe.txt", content, "text/plain")}
    )
    assert first.status_code == 201

    second = client.post(
        "/api/upload", headers=headers, files={"file": ("dupe.txt", content, "text/plain")}
    )
    assert second.status_code == 409


def test_upload_requires_auth(client):
    resp = client.post(
        "/api/upload", files={"file": ("notes.txt", b"hello world", "text/plain")}
    )
    assert resp.status_code == 401


def test_list_documents_reflects_uploads(client):
    headers = _register_and_login(client, "lister@example.com")
    client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("a.txt", _make_txt_bytes("Alpha document text."), "text/plain")},
    )
    client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("b.txt", _make_txt_bytes("Beta document text."), "text/plain")},
    )

    resp = client.get("/api/documents", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_documents"] == 2
    assert body["total_storage_bytes"] > 0
    filenames = {d["original_filename"] for d in body["documents"]}
    assert filenames == {"a.txt", "b.txt"}


def test_documents_are_isolated_per_user(client):
    headers_a = _register_and_login(client, "usera@example.com")
    headers_b = _register_and_login(client, "userb@example.com")

    client.post(
        "/api/upload",
        headers=headers_a,
        files={"file": ("only_a.txt", _make_txt_bytes("User A's private document."), "text/plain")},
    )

    resp_b = client.get("/api/documents", headers=headers_b)
    assert resp_b.json()["total_documents"] == 0

    resp_a = client.get("/api/documents", headers=headers_a)
    assert resp_a.json()["total_documents"] == 1


def test_delete_document(client):
    headers = _register_and_login(client, "deleter@example.com")
    upload_resp = client.post(
        "/api/upload",
        headers=headers,
        files={"file": ("delete_me.txt", _make_txt_bytes("Temporary content."), "text/plain")},
    )
    doc_id = upload_resp.json()["id"]

    delete_resp = client.delete(f"/api/document/{doc_id}", headers=headers)
    assert delete_resp.status_code == 204

    list_resp = client.get("/api/documents", headers=headers)
    assert list_resp.json()["total_documents"] == 0


def test_delete_nonexistent_document_returns_404(client):
    headers = _register_and_login(client, "deleter2@example.com")
    resp = client.delete("/api/document/does-not-exist", headers=headers)
    assert resp.status_code == 404


def test_cannot_delete_another_users_document(client):
    headers_a = _register_and_login(client, "owner@example.com")
    headers_b = _register_and_login(client, "intruder@example.com")

    upload_resp = client.post(
        "/api/upload",
        headers=headers_a,
        files={"file": ("owned.txt", _make_txt_bytes("Owner's content."), "text/plain")},
    )
    doc_id = upload_resp.json()["id"]

    resp = client.delete(f"/api/document/{doc_id}", headers=headers_b)
    assert resp.status_code == 404  # not found *for this user*, not a 403 leak of existence details
