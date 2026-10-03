import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database.connection import get_db
from models.auth_session import AuthSessionDB
from models.user import UserDB


bearer_scheme = HTTPBearer(auto_error=False)
PASSWORD_ITERATIONS = 600_000
SESSION_DAYS = 14


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PASSWORD_ITERATIONS)
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, iterations, salt, expected = encoded.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), int(iterations))
        return secrets.compare_digest(digest.hex(), expected)
    except (ValueError, TypeError):
        return False


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_session(db: Session, user: UserDB) -> str:
    token = secrets.token_urlsafe(32)
    db.add(AuthSessionDB(user_id=user.id, token_hash=_token_hash(token), expires_at=datetime.utcnow() + timedelta(days=SESSION_DAYS)))
    db.commit()
    return token


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserDB:
    if not credentials:
        raise HTTPException(status_code=401, detail="Sign in to continue")
    session = db.query(AuthSessionDB).filter_by(token_hash=_token_hash(credentials.credentials)).first()
    if not session or session.expires_at <= datetime.utcnow():
        raise HTTPException(status_code=401, detail="Your session has expired. Sign in again.")
    user = db.query(UserDB).filter_by(id=session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Account no longer exists")
    return user


def user_payload(user: UserDB) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "organization": user.organization,
        "location": user.location,
    }