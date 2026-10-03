# RELIVO

RELIVO is a circular resource exchange MVP. The React/Vite client uses the FastAPI API as its source of truth; SQLAlchemy persists accounts, resources, sessions, and requests in SQLite.

## Run locally

Install the backend requirements into the repository virtual environment:

```powershell
py -3.12 -m venv venv
.\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Start FastAPI from the backend directory (the default database path is stable at `backend/resources.db`):

```powershell
Push-Location backend
..\venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
Pop-Location
```

In another terminal, install and start the frontend:

```powershell
npm install
$env:VITE_API_URL = "http://127.0.0.1:8000"
npm run dev -- --host 127.0.0.1
```

Open <http://localhost:3000>. FastAPI docs are at <http://127.0.0.1:8000/docs>. `VITE_API_URL` is compiled into the client; configure `RELIVO_ALLOWED_ORIGINS` on the backend for the deployed frontend origin. Copy `.env.example` as a reference for the variable names.

## Data and security

The application does not seed demo accounts or resources. Existing resource rows are kept when the database schema is upgraded. New accounts require a unique email and passwords are PBKDF2-SHA256 hashed; opaque, expiring bearer sessions are stored hashed in SQLite. Public registration permits donor and recipient roles; admin accounts are not self-registered.

Uploaded images are limited to 5 MB, checked against MIME type, signature, decodable format, and pixel count, stored under `backend/uploads/` by generated filename, and referenced by a relative `/uploads/...` path in SQLite. Keep both the database and upload directory persistent in deployments.

Requests are created in serialized SQLite transactions. Inventory is allocated once, duplicate active requests are rejected, unavailable quantities waitlist, urgent requests start with higher priority, and queue age adds five priority points per full day (capped at 100). Rejecting an allocated/reserved request returns its quantity to the queue.

## Verify

```powershell
npm run check
npm run build
.\venv\Scripts\python.exe -m unittest backend.tests.test_api_workflow -v
```

The backend workflow test launches a separate API process with temporary SQLite and upload storage; it does not modify `backend/resources.db`.
