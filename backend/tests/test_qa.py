def _register_and_login(client, email):
    client.post(
        "/api/register",
        json={"email": email, "full_name": "QA Tester", "password": "supersecret123"},
    )
    resp = client.post("/api/login", json={"email": email, "password": "supersecret123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _upload_txt(client, headers, filename, content):
    return client.post(
        "/api/upload",
        headers=headers,
        files={"file": (filename, content.encode("utf-8"), "text/plain")},
    )


def test_ask_returns_grounded_answer_with_citations(client):
    headers = _register_and_login(client, "asker1@example.com")
    _upload_txt(
        client,
        headers,
        "france.txt",
        "The capital of France is Paris. Paris is home to the Eiffel Tower and the Louvre museum.",
    )

    resp = client.post(
        "/api/ask", headers=headers, json={"question": "What is the capital of France?"}
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["answer"]
    assert body["confidence"] > 0
    assert len(body["sources"]) >= 1
    assert body["sources"][0]["document_name"] == "france.txt"
    assert body["sources"][0]["page"] == 1


def test_ask_with_no_documents_returns_fallback(client):
    headers = _register_and_login(client, "asker2@example.com")
    resp = client.post(
        "/api/ask", headers=headers, json={"question": "What is the meaning of life?"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["answer"] == "I couldn't find relevant information in the uploaded documents."
    assert body["sources"] == []
    assert body["confidence"] == 0


def test_ask_with_unrelated_question_returns_fallback(client):
    headers = _register_and_login(client, "asker3@example.com")
    _upload_txt(
        client, headers, "cooking.txt", "This recipe uses flour, sugar, butter, and eggs to bake a cake."
    )

    resp = client.post(
        "/api/ask",
        headers=headers,
        json={"question": "What is the quarterly revenue growth rate for semiconductor exports?"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["answer"] == "I couldn't find relevant information in the uploaded documents."
    assert body["confidence"] == 0


def test_ask_rejects_empty_question(client):
    headers = _register_and_login(client, "asker4@example.com")
    resp = client.post("/api/ask", headers=headers, json={"question": ""})
    assert resp.status_code == 422  # pydantic min_length validation


def test_ask_requires_auth(client):
    resp = client.post("/api/ask", json={"question": "Hello?"})
    assert resp.status_code == 401


def test_ask_is_isolated_per_user(client):
    headers_a = _register_and_login(client, "isoaska@example.com")
    headers_b = _register_and_login(client, "isoaskb@example.com")

    _upload_txt(
        client, headers_a, "secret.txt", "The secret launch code for project Phoenix is 42-Alpha-Nine."
    )

    resp_b = client.post(
        "/api/ask", headers=headers_b, json={"question": "What is the secret launch code for project Phoenix?"}
    )
    assert resp_b.status_code == 200
    body_b = resp_b.json()
    # User B has no documents, so must get the fallback — never user A's content.
    assert body_b["answer"] == "I couldn't find relevant information in the uploaded documents."
    assert body_b["sources"] == []


def test_ask_saves_to_history(client):
    headers = _register_and_login(client, "historyuser@example.com")
    _upload_txt(client, headers, "notes.txt", "Docker isolates applications using containers.")

    client.post("/api/ask", headers=headers, json={"question": "What does Docker do?"})

    resp = client.get("/api/history", headers=headers)
    assert resp.status_code == 200
    history = resp.json()
    assert len(history) == 1
    assert history[0]["question"] == "What does Docker do?"
    assert "confidence" in history[0]


def test_history_requires_auth(client):
    resp = client.get("/api/history")
    assert resp.status_code == 401


def test_clear_history(client):
    headers = _register_and_login(client, "clearhistory@example.com")
    _upload_txt(client, headers, "notes.txt", "Kubernetes orchestrates containerized applications.")
    client.post("/api/ask", headers=headers, json={"question": "What does Kubernetes do?"})

    assert len(client.get("/api/history", headers=headers).json()) == 1

    clear_resp = client.delete("/api/history", headers=headers)
    assert clear_resp.status_code == 204

    assert len(client.get("/api/history", headers=headers).json()) == 0


def test_ask_can_be_scoped_to_specific_document(client):
    headers = _register_and_login(client, "scopeduser@example.com")
    doc1 = _upload_txt(client, headers, "doc1.txt", "The project deadline is March 15th.").json()
    _upload_txt(client, headers, "doc2.txt", "The project deadline is March 15th as well, unrelated doc.")

    resp = client.post(
        "/api/ask",
        headers=headers,
        json={"question": "When is the project deadline?", "document_ids": [doc1["id"]]},
    )
    assert resp.status_code == 200
    body = resp.json()
    if body["sources"]:
        assert all(s["document_id"] == doc1["id"] for s in body["sources"])
