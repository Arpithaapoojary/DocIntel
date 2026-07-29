def test_health_check(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_register_new_user(client):
    resp = client.post(
        "/api/register",
        json={"email": "alice@example.com", "full_name": "Alice", "password": "supersecret123"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "alice@example.com"
    assert "hashed_password" not in data  # never leak the hash


def test_register_duplicate_email_rejected(client):
    payload = {"email": "bob@example.com", "full_name": "Bob", "password": "supersecret123"}
    first = client.post("/api/register", json=payload)
    assert first.status_code == 201

    second = client.post("/api/register", json=payload)
    assert second.status_code == 400


def test_login_success_returns_token(client):
    client.post(
        "/api/register",
        json={"email": "carol@example.com", "full_name": "Carol", "password": "supersecret123"},
    )
    resp = client.post(
        "/api/login", json={"email": "carol@example.com", "password": "supersecret123"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password_rejected(client):
    client.post(
        "/api/register",
        json={"email": "dave@example.com", "full_name": "Dave", "password": "supersecret123"},
    )
    resp = client.post(
        "/api/login", json={"email": "dave@example.com", "password": "wrongpassword"}
    )
    assert resp.status_code == 401


def test_protected_me_requires_token(client):
    resp = client.get("/api/me")
    assert resp.status_code == 401


def test_protected_me_with_valid_token(client):
    client.post(
        "/api/register",
        json={"email": "erin@example.com", "full_name": "Erin", "password": "supersecret123"},
    )
    login_resp = client.post(
        "/api/login", json={"email": "erin@example.com", "password": "supersecret123"}
    )
    token = login_resp.json()["access_token"]

    resp = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "erin@example.com"
