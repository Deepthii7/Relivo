import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database.connection import get_db
from models.auth_session import AuthSessionDB
from models.user import UserDB
from services.security import create_session, get_current_user, hash_password, user_payload, verify_password


router = APIRouter(prefix="/auth", tags=["Authentication"])
optional_bearer = HTTPBearer(auto_error=False)


class Credentials(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)


class Registration(Credentials):
    name: str = Field(min_length=1, max_length=100)
    organization: str = Field(min_length=1, max_length=160)
    location: str = Field(default="", max_length=160)
    role: str = "recipient"


def valid_email(value: str) -> bool:
    return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value.strip()))


@router.post("/register", status_code=201)
def register(payload: Registration, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if not valid_email(email):
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    if payload.role not in ("donor", "recipient"):
        raise HTTPException(status_code=422, detail="Choose donor or recipient")
    if db.query(UserDB).filter_by(email=email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = UserDB(
        name=payload.name.strip(), email=email, password_hash=hash_password(payload.password),
        role=payload.role, organization=payload.organization.strip(), location=payload.location.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_session(db, user)
    return {"token": token, "user": user_payload(user)}


@router.post("/login")
def login(payload: Credentials, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(UserDB).filter_by(email=email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect")
    return {"token": create_session(db, user), "user": user_payload(user)}


@router.get("/me")
def me(user: UserDB = Depends(get_current_user)):
    return {"user": user_payload(user)}


@router.post("/logout", status_code=204)
def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer),
    db: Session = Depends(get_db),
):
    if credentials:
        from services.security import _token_hash
        db.query(AuthSessionDB).filter_by(token_hash=_token_hash(credentials.credentials)).delete()
        db.commit()