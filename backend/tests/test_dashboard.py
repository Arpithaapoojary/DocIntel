def _register_and_login(client, email):
    client.post(
        "/api/register",
        json={"email": email, "full_name": "Dashboard Tester", "password": "supersecret123"},
    )
    resp = client.post("/api/login", json={"email": email, "password": "supersecret123"})
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _upload_txt(client, headers, filename, content):
    return client.post(
        "/api/upload",
        headers=headers,
        files={"file": (filename, content.encode("utf-8"), "text/plain")},
    )


def test_dashboard_reflects_uploads_and_questions(client):
    headers = _register_and_login(client, "dash1@example.com")
    _upload_txt(client, headers, "a.txt", "Docker isolates applications using containers.")
    _upload_txt(client, headers, "b.txt", "Kubernetes orchestrates containerized workloads at scale.")
    client.post("/api/ask", headers=headers, json={"question": "What does Docker do?"})

    resp = client.get("/api/dashboard", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_documents"] == 2
    assert body["total_questions_asked"] == 1
    assert body["storage_used_bytes"] > 0
    assert len(body["recent_documents"]) == 2
    assert len(body["recent_questions"]) == 1


def test_dashboard_empty_for_new_user(client):
    headers = _register_and_login(client, "dash2@example.com")
    resp = client.get("/api/dashboard", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_documents"] == 0
    assert body["total_questions_asked"] == 0
    assert body["storage_used_bytes"] == 0
    assert body["recent_documents"] == []
    assert body["recent_questions"] == []


def test_dashboard_requires_auth(client):
    resp = client.get("/api/dashboard")
    assert resp.status_code == 401


def test_dashboard_is_isolated_per_user(client):
    headers_a = _register_and_login(client, "dashisoa@example.com")
    headers_b = _register_and_login(client, "dashisob@example.com")
    _upload_txt(client, headers_a, "only_a.txt", "Content that belongs only to user A.")

    resp_b = client.get("/api/dashboard", headers=headers_b)
    assert resp_b.json()["total_documents"] == 0
