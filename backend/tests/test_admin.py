def _register_and_login(client, email):
    client.post(
        "/api/register",
        json={"email": email, "full_name": "Admin Tester", "password": "supersecret123"},
    )
    resp = client.post("/api/login", json={"email": email, "password": "supersecret123"})
    return resp.json()


def _upload_txt(client, headers, filename, content):
    return client.post(
        "/api/upload",
        headers=headers,
        files={"file": (filename, content.encode("utf-8"), "text/plain")},
    )


def test_first_registered_user_becomes_admin(client):
    # Each test gets a fresh, isolated DB (see conftest.py), so the first
    # registration in this test is guaranteed to be the first user overall.
    login = _register_and_login(client, "firstadmin@example.com")
    assert login["user"]["is_admin"] is True


def test_second_registered_user_is_not_admin(client):
    _register_and_login(client, "admin@example.com")
    login = _register_and_login(client, "regular@example.com")
    assert login["user"]["is_admin"] is False


def test_non_admin_cannot_list_users(client):
    _register_and_login(client, "admin2@example.com")  # becomes admin, unused here
    regular_login = _register_and_login(client, "regular2@example.com")
    headers = {"Authorization": f"Bearer {regular_login['access_token']}"}

    resp = client.get("/api/admin/users", headers=headers)
    assert resp.status_code == 403


def test_admin_can_list_users(client):
    admin_login = _register_and_login(client, "admin3@example.com")
    _register_and_login(client, "regular3@example.com")
    headers = {"Authorization": f"Bearer {admin_login['access_token']}"}

    resp = client.get("/api/admin/users", headers=headers)
    assert resp.status_code == 200
    emails = {u["email"] for u in resp.json()}
    assert emails == {"admin3@example.com", "regular3@example.com"}


def test_admin_endpoints_require_auth(client):
    resp = client.get("/api/admin/users")
    assert resp.status_code == 401


def test_admin_can_view_analytics(client):
    admin_login = _register_and_login(client, "admin4@example.com")
    headers = {"Authorization": f"Bearer {admin_login['access_token']}"}
    _upload_txt(client, headers, "notes.txt", "Some analytics test content about servers.")
    client.post("/api/ask", headers=headers, json={"question": "What is this about?"})

    resp = client.get("/api/admin/analytics", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["total_users"] == 1
    assert body["total_documents"] == 1
    assert body["total_questions_asked"] == 1
    assert body["total_storage_bytes"] > 0


def test_admin_can_delete_any_users_document(client):
    admin_login = _register_and_login(client, "admin5@example.com")
    admin_headers = {"Authorization": f"Bearer {admin_login['access_token']}"}
    regular_login = _register_and_login(client, "regular5@example.com")
    regular_headers = {"Authorization": f"Bearer {regular_login['access_token']}"}

    upload_resp = _upload_txt(client, regular_headers, "owned.txt", "Content owned by a regular user.")
    doc_id = upload_resp.json()["id"]

    del_resp = client.delete(f"/api/admin/documents/{doc_id}", headers=admin_headers)
    assert del_resp.status_code == 204

    list_resp = client.get("/api/documents", headers=regular_headers)
    assert list_resp.json()["total_documents"] == 0


def test_regular_user_cannot_use_admin_delete_document(client):
    _register_and_login(client, "admin6@example.com")
    regular_login = _register_and_login(client, "regular6@example.com")
    regular_headers = {"Authorization": f"Bearer {regular_login['access_token']}"}

    upload_resp = _upload_txt(client, regular_headers, "notes.txt", "Some content here.")
    doc_id = upload_resp.json()["id"]

    resp = client.delete(f"/api/admin/documents/{doc_id}", headers=regular_headers)
    assert resp.status_code == 403


def test_admin_can_delete_user_and_it_cascades(client):
    admin_login = _register_and_login(client, "admin7@example.com")
    admin_headers = {"Authorization": f"Bearer {admin_login['access_token']}"}
    regular_login = _register_and_login(client, "regular7@example.com")
    regular_headers = {"Authorization": f"Bearer {regular_login['access_token']}"}
    regular_user_id = regular_login["user"]["id"]

    _upload_txt(client, regular_headers, "notes.txt", "Content that should be cascade-deleted.")

    del_resp = client.delete(f"/api/admin/users/{regular_user_id}", headers=admin_headers)
    assert del_resp.status_code == 204

    # The deleted user's token should no longer resolve to a valid user.
    me_resp = client.get("/api/me", headers=regular_headers)
    assert me_resp.status_code == 401


def test_admin_cannot_delete_own_account(client):
    admin_login = _register_and_login(client, "admin8@example.com")
    admin_headers = {"Authorization": f"Bearer {admin_login['access_token']}"}
    admin_id = admin_login["user"]["id"]

    resp = client.delete(f"/api/admin/users/{admin_id}", headers=admin_headers)
    assert resp.status_code == 400


def test_admin_delete_nonexistent_user_returns_404(client):
    admin_login = _register_and_login(client, "admin9@example.com")
    admin_headers = {"Authorization": f"Bearer {admin_login['access_token']}"}

    resp = client.delete("/api/admin/users/does-not-exist", headers=admin_headers)
    assert resp.status_code == 404
