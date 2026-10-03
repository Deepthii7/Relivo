import base64
from concurrent.futures import ThreadPoolExecutor
import json
import os
import signal
import socket
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path


class RelivoWorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory(prefix="relivo-workflow-")
        cls.db_path = Path(cls.temp_dir.name) / "workflow.sqlite3"
        cls.upload_dir = Path(cls.temp_dir.name) / "uploads"
        cls.backend_dir = Path(__file__).resolve().parents[1]
        cls.env = os.environ.copy()
        cls.env["RELIVO_DATABASE_URL"] = f"sqlite:///{cls.db_path.as_posix()}"
        cls.env["RELIVO_UPLOAD_DIR"] = str(cls.upload_dir)
        cls.env["RELIVO_ALLOWED_ORIGINS"] = "http://localhost:3000"
        cls._start_server()

    @classmethod
    def tearDownClass(cls):
        cls._stop_server()
        cls.temp_dir.cleanup()

    @classmethod
    def _start_server(cls):
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            cls.port = probe.getsockname()[1]
        cls.base_url = f"http://127.0.0.1:{cls.port}"
        cls.server_log = tempfile.TemporaryFile()
        cls.server = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(cls.port)],
            cwd=cls.backend_dir,
            env=cls.env,
            stdout=cls.server_log,
            stderr=subprocess.STDOUT,
            creationflags=getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0),
        )
        deadline = time.monotonic() + 20
        while time.monotonic() < deadline:
            if cls.server.poll() is not None:
                cls.server_log.seek(0)
                raise RuntimeError(cls.server_log.read().decode(errors="replace"))
            try:
                cls._request("GET", "/health")
                return
            except (OSError, urllib.error.URLError):
                time.sleep(0.1)
        cls._stop_server()
        raise RuntimeError("FastAPI did not become ready in time")

    @classmethod
    def _stop_server(cls):
        server = getattr(cls, "server", None)
        if server and server.poll() is None:
            if os.name == "nt":
                server.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                server.terminate()
            try:
                server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait(timeout=10)
        log = getattr(cls, "server_log", None)
        if log:
            log.close()

    @classmethod
    def _request(cls, method, path, payload=None, token=None, headers=None):
        request_headers = dict(headers or {})
        body = payload
        if isinstance(payload, dict):
            body = json.dumps(payload).encode()
            request_headers.setdefault("Content-Type", "application/json")
        if token:
            request_headers["Authorization"] = f"Bearer {token}"
        request = urllib.request.Request(cls.base_url + path, data=body, headers=request_headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                content = response.read()
                parsed = json.loads(content) if content and response.headers.get("Content-Type", "").startswith("application/json") else None
                return response.status, parsed
        except urllib.error.HTTPError as error:
            content = error.read()
            parsed = json.loads(content) if content and error.headers.get("Content-Type", "").startswith("application/json") else None
            return error.code, parsed

    @staticmethod
    def _multipart(fields, image_bytes=None, filename="resource.png", content_type="image/png"):
        boundary = f"relivo-{uuid.uuid4().hex}"
        chunks = []
        for name, value in fields.items():
            chunks.extend([
                f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n".encode(),
                str(value).encode(), b"\r\n",
            ])
        if image_bytes is not None:
            chunks.extend([
                f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{filename}\"\r\nContent-Type: {content_type}\r\n\r\n".encode(),
                image_bytes, b"\r\n",
            ])
        chunks.append(f"--{boundary}--\r\n".encode())
        return b"".join(chunks), f"multipart/form-data; boundary={boundary}"

    def _register(self, role, label):
        email = f"{label}.{uuid.uuid4().hex[:8]}@example.com"
        status, response = self._request("POST", "/auth/register", {
            "name": label.title(), "email": email, "password": "Relivo-Test-Password-2026",
            "organization": f"{label.title()} Organization", "location": "Bay Area", "role": role,
        })
        self.assertEqual(status, 201, response)
        self.assertEqual(response["user"]["email"], email)
        return email, response["token"]

    def test_persistent_auth_upload_matching_queue_and_aging(self):
        donor_email, donor_token = self._register("donor", "donor")
        recipient_one_email, recipient_one_token = self._register("recipient", "recipient-one")
        recipient_two_email, recipient_two_token = self._register("recipient", "recipient-two")

        status, login_response = self._request("POST", "/auth/login", {
            "email": donor_email.upper(), "password": "Relivo-Test-Password-2026",
        })
        self.assertEqual(status, 200)
        self.assertEqual(login_response["user"]["email"], donor_email)
        self.assertNotIn("password", login_response["user"])
        self.assertEqual(self._request("POST", "/auth/login", {
            "email": donor_email, "password": "wrong-password",
        })[0], 401)

        valid_png = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=")
        fields = {
            "title": "Practical Laptops", "category": "Electronics", "quantity": 3,
            "condition": "Good", "location": "Bay Area", "description": "Three working laptops for a computer lab.",
        }
        invalid_body, invalid_type = self._multipart(fields, b"not an image")
        invalid_status, _ = self._request("POST", "/resources", invalid_body, donor_token, {"Content-Type": invalid_type})
        self.assertEqual(invalid_status, 415)
        spoofed_body, spoofed_type = self._multipart(fields, b"\x89PNG\r\n\x1a\nnot a decoded PNG")
        spoofed_status, _ = self._request("POST", "/resources", spoofed_body, donor_token, {"Content-Type": spoofed_type})
        self.assertEqual(spoofed_status, 415)

        body, content_type = self._multipart(fields, valid_png)
        status, upload_response = self._request("POST", "/resources", body, donor_token, {"Content-Type": content_type})
        self.assertEqual(status, 201, upload_response)
        resource = upload_response["resource"]
        self.assertIsNotNone(resource["donorId"])
        self.assertTrue(resource["imageUrl"].startswith("/uploads/"))

        status, browse_response = self._request("GET", "/resources?q=Practical%20Laptops&category=Electronics")
        self.assertEqual(status, 200)
        self.assertEqual([item["id"] for item in browse_response["resources"]], [resource["id"]])
        status, legacy_search = self._request("GET", "/resources/search?name=Practical%20Laptops&location=Bay%20Area")
        self.assertEqual(status, 200)
        self.assertEqual([item["id"] for item in legacy_search["resources"]], [resource["id"]])
        self.assertEqual(self._request("GET", f"/resources/{resource['id']}")[1]["resource"]["title"], "Practical Laptops")
        with urllib.request.urlopen(self.base_url + resource["imageUrl"], timeout=5) as image_response:
            self.assertEqual(image_response.status, 200)
            self.assertEqual(image_response.read(), valid_png)

        status, matches = self._request("GET", "/resources/match?category=Electronics&location=Bay%20Area")
        self.assertEqual(status, 200)
        self.assertEqual(matches["matches"][0]["id"], resource["id"])

        first_status, first = self._request("POST", "/requests", {
            "resourceId": resource["id"], "quantity": 2, "reason": "Our classroom needs working devices.",
        }, recipient_one_token)
        self.assertEqual(first_status, 201, first)
        self.assertEqual(first["request"]["status"], "Allocated")
        second_status, second = self._request("POST", "/requests", {
            "resourceId": resource["id"], "quantity": 2, "reason": "We need two devices for students.",
        }, recipient_two_token)
        self.assertEqual(second_status, 201, second)
        self.assertEqual(second["request"]["status"], "Waitlisted")
        duplicate_status, _ = self._request("POST", "/requests", {
            "resourceId": resource["id"], "quantity": 1, "reason": "A second active request for this item.",
        }, recipient_two_token)
        self.assertEqual(duplicate_status, 409)
        self.assertEqual(self._request("GET", "/resources")[1]["resources"][0]["quantity"], 1)

        status, decision = self._request("PATCH", f"/requests/{first['request']['id']}/decision", {"decision": "reject"}, donor_token)
        self.assertEqual(status, 200, decision)
        self.assertEqual(decision["request"]["status"], "Rejected")
        self.assertEqual(self._request("GET", "/requests", token=recipient_two_token)[1]["requests"][0]["status"], "Allocated")
        self.assertEqual(self._request("GET", "/resources")[1]["resources"][0]["quantity"], 1)
        status, approved = self._request("PATCH", f"/requests/{second['request']['id']}/decision", {"decision": "approve"}, donor_token)
        self.assertEqual(status, 200)
        self.assertEqual(approved["request"]["status"], "Reserved")

        connection = sqlite3.connect(self.db_path)
        try:
            stored_user = connection.execute("SELECT email, password_hash FROM users WHERE email = ?", (donor_email,)).fetchone()
            self.assertEqual(stored_user[0], donor_email)
            self.assertNotEqual(stored_user[1], "Relivo-Test-Password-2026")
            stored_resource = connection.execute("SELECT image_url, quantity FROM resources WHERE id = ?", (resource["id"],)).fetchone()
            self.assertEqual(stored_resource, (resource["imageUrl"], 1))
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM requests").fetchone()[0], 2)
            old = (datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=30)).isoformat(sep=" ")
            connection.execute("UPDATE requests SET created_at = ? WHERE id = ?", (old, second["request"]["id"]))
            connection.commit()
        finally:
            connection.close()

        status, recipient_queue = self._request("GET", "/requests", token=recipient_two_token)
        self.assertEqual(status, 200)
        self.assertEqual(recipient_queue["requests"][0]["priority"], 100)
        self.assertEqual(self._request("GET", "/notifications", token=recipient_two_token)[0], 200)
        self.assertEqual(self._request("GET", "/analytics")[0], 200)

        status, preflight = self._request("OPTIONS", "/auth/login", headers={
            "Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        })
        self.assertEqual(status, 200)
        self.assertEqual(preflight, None)

        contention_fields = {
            "title": "Concurrent Pool", "category": "Furniture", "quantity": 1,
            "condition": "Good", "location": "Bay Area", "description": "One table for synchronized allocation.",
        }
        contention_body, contention_type = self._multipart(contention_fields)
        status, contention_resource = self._request("POST", "/resources", contention_body, donor_token, {"Content-Type": contention_type})
        self.assertEqual(status, 201)
        contention_id = contention_resource["resource"]["id"]

        def contend(token, reason):
            return self._request("POST", "/requests", {
                "resourceId": contention_id, "quantity": 1, "reason": reason,
            }, token)

        with ThreadPoolExecutor(max_workers=2) as pool:
            outcomes = list(pool.map(
                lambda args: contend(*args),
                [
                    (recipient_one_token, "One unit is needed for our school.",),
                    (recipient_two_token, "Our class urgently needs this unit.",),
                ],
            ))
        self.assertEqual([status for status, _ in outcomes], [201, 201])
        self.assertEqual(sorted(result["request"]["status"] for _, result in outcomes), ["Allocated", "Waitlisted"])
        self.assertEqual(self._request("GET", f"/resources/{contention_id}")[1]["resource"]["quantity"], 0)

        scheduling_fields = {
            "title": "Scarce Classroom Kits", "category": "Educational", "quantity": 1,
            "condition": "Good", "location": "Bay Area", "description": "One kit for a classroom.",
        }
        scheduling_body, scheduling_type = self._multipart(scheduling_fields)
        status, scheduling_upload = self._request("POST", "/resources", scheduling_body, donor_token, {"Content-Type": scheduling_type})
        self.assertEqual(status, 201)
        scarce_id = scheduling_upload["resource"]["id"]
        _, holder_token = self._register("recipient", "inventory-holder")
        _, urgent_token = self._register("recipient", "urgent-school")
        _, aging_token = self._register("recipient", "aging-school")
        _, later_token = self._register("recipient", "later-school")
        holder = self._request("POST", "/requests", {
            "resourceId": scarce_id, "quantity": 1, "reason": "We need this for a classroom.",
        }, holder_token)[1]["request"]
        urgent = self._request("POST", "/requests", {
            "resourceId": scarce_id, "quantity": 1, "reason": "Urgent classroom access is critical.",
        }, urgent_token)[1]["request"]
        aging = self._request("POST", "/requests", {
            "resourceId": scarce_id, "quantity": 1, "reason": "We need one kit for students.",
        }, aging_token)[1]["request"]
        self.assertEqual(holder["status"], "Allocated")
        self.assertEqual(urgent["status"], "Waitlisted")
        self.assertEqual(aging["status"], "Waitlisted")

        connection = sqlite3.connect(self.db_path)
        try:
            connection.execute("UPDATE resources SET quantity = 1 WHERE id = ?", (scarce_id,))
            connection.commit()
        finally:
            connection.close()
        later = self._request("POST", "/requests", {
            "resourceId": scarce_id, "quantity": 1, "reason": "We need a kit for class.",
        }, later_token)[1]["request"]
        self.assertEqual(self._request("GET", "/requests", token=urgent_token)[1]["requests"][0]["status"], "Allocated")
        self.assertEqual(self._request("GET", "/requests", token=aging_token)[1]["requests"][0]["status"], "Waitlisted")

        connection = sqlite3.connect(self.db_path)
        try:
            old = (datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=30)).isoformat(sep=" ")
            connection.execute("UPDATE requests SET created_at = ? WHERE id = ?", (old, aging["id"]))
            connection.commit()
        finally:
            connection.close()
        status, released = self._request("PATCH", f"/requests/{urgent['id']}/decision", {"decision": "reject"}, donor_token)
        self.assertEqual(status, 200)
        self.assertEqual(released["request"]["status"], "Rejected")
        self.assertEqual(self._request("GET", "/requests", token=aging_token)[1]["requests"][0]["status"], "Allocated")
        later_queue = self._request("GET", "/requests", token=later_token)[1]["requests"]
        self.assertEqual(later_queue[0]["status"], "Waitlisted")

        self._stop_server()
        self._start_server()
        status, restored_session = self._request("GET", "/auth/me", token=donor_token)
        self.assertEqual(status, 200)
        self.assertEqual(restored_session["user"]["email"], donor_email)
        self.assertEqual(self._request("GET", f"/resources/{resource['id']}")[0], 200)


if __name__ == "__main__":
    unittest.main()
