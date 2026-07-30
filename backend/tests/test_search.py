def _register_and_login(client, email):
    client.post(
        "/api/register",
        json={"email": email, "full_name": "Search Tester", "password": "supersecret123"},
    )
    resp = client.post("/api/login", json={"email": email, "password": "supersecret123"})
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _upload_txt(client, headers, filename, content):
    return client.post(
        "/api/upload",
        headers=headers,
        files={"file": (filename, content.encode("utf-8"), "text/plain")},
    )


def test_semantic_search_finds_relevant_chunk(client):
    headers = _register_and_login(client, "search1@example.com")
    _upload_txt(client, headers, "france.txt", "The capital of France is Paris, a major European city.")

    resp = client.post(
        "/api/search", headers=headers, json={"query": "capital France Paris", "mode": "semantic"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_results"] >= 1
    assert body["results"][0]["document_name"] == "france.txt"
    assert body["results"][0]["similarity"] is not None


def test_keyword_search_finds_exact_substring(client):
    headers = _register_and_login(client, "search2@example.com")
    _upload_txt(client, headers, "notes.txt", "The quarterly revenue figure was forty two million dollars.")

    resp = client.post(
        "/api/search",
        headers=headers,
        json={"query": "forty two million", "mode": "keyword"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_results"] == 1
    assert "forty two million" in body["results"][0]["snippet"]


def test_keyword_search_no_match_returns_empty(client):
    headers = _register_and_login(client, "search3@example.com")
    _upload_txt(client, headers, "notes.txt", "This document is about gardening and plants.")

    resp = client.post(
        "/api/search", headers=headers, json={"query": "quantum physics equations", "mode": "keyword"}
    )
    assert resp.status_code == 200
    assert resp.json()["total_results"] == 0


def test_search_can_be_filtered_to_specific_document(client):
    headers = _register_and_login(client, "search4@example.com")
    doc1 = _upload_txt(client, headers, "doc1.txt", "The launch date is set for June.").json()
    _upload_txt(client, headers, "doc2.txt", "The launch date is also mentioned here, June again.")

    resp = client.post(
        "/api/search",
        headers=headers,
        json={"query": "launch date June", "mode": "keyword", "document_ids": [doc1["id"]]},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert all(r["document_id"] == doc1["id"] for r in body["results"])


def test_search_requires_auth(client):
    resp = client.post("/api/search", json={"query": "anything"})
    assert resp.status_code == 401


def test_search_is_isolated_per_user(client):
    headers_a = _register_and_login(client, "searchisoa@example.com")
    headers_b = _register_and_login(client, "searchisob@example.com")
    _upload_txt(client, headers_a, "secret.txt", "The confidential merger price is ninety million dollars.")

    resp_b = client.post(
        "/api/search",
        headers=headers_b,
        json={"query": "confidential merger price ninety million", "mode": "keyword"},
    )
    assert resp_b.status_code == 200
    assert resp_b.json()["total_results"] == 0
