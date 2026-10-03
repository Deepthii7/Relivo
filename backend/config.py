import os
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv("RELIVO_DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'resources.db'}")
UPLOAD_DIR = Path(os.getenv("RELIVO_UPLOAD_DIR", str(BACKEND_DIR / "uploads"))).resolve()
ALLOWED_ORIGINS = [
    origin.strip() for origin in os.getenv(
        "RELIVO_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:4173,http://127.0.0.1:4173",
    ).split(",") if origin.strip()
]