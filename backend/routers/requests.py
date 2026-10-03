from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from database.connection import get_db
from models.request import RequestDB
from models.resource import ResourceDB
from models.user import UserDB
from services.scheduling import ACTIVE_STATUSES, effective_priority, schedule_resource_queue
from services.security import get_current_user


router = APIRouter(prefix="/requests", tags=["Requests"])


class RequestCreate(BaseModel):
    resourceId: int
    quantity: int = Field(gt=0, le=100000)
    reason: str = Field(min_length=10, max_length=3000)


class RequestDecision(BaseModel):
    decision: str


def request_payload(request: RequestDB, db: Session) -> dict:
    resource = db.query(ResourceDB).filter_by(id=request.resource_id).first()
    recipient = db.query(UserDB).filter_by(id=request.recipient_id).first()
    owner = db.query(UserDB).filter_by(id=resource.donor_id).first() if resource and resource.donor_id else None
    return {
        "id": request.id, "resourceId": request.resource_id,
        "resourceTitle": resource.title if resource else "Resource unavailable",
        "resourceOwnerId": owner.id if owner else None,
        "recipientId": request.recipient_id,
        "recipientName": recipient.name if recipient else "",
        "recipientOrg": recipient.organization if recipient else "",
        "quantity": request.quantity, "priority": effective_priority(request),
        "status": request.status, "reason": request.reason,
        "createdAt": request.created_at.isoformat(),
    }


@router.get("")
def get_requests(user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(RequestDB)
    if user.role == "recipient":
        query = query.filter(RequestDB.recipient_id == user.id)
    elif user.role == "donor":
        query = query.join(ResourceDB, RequestDB.resource_id == ResourceDB.id).filter(ResourceDB.donor_id == user.id)
    requests = query.all()
    requests.sort(key=lambda item: (-effective_priority(item), item.created_at, item.id))
    return {"requests": [request_payload(item, db) for item in requests]}


@router.post("", status_code=201)
def create_request(payload: RequestCreate, user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role not in ("recipient", "admin"):
        raise HTTPException(status_code=403, detail="Only recipients can request resources")
    db.execute(text("BEGIN IMMEDIATE"))
    resource = db.query(ResourceDB).filter_by(id=payload.resourceId).first()
    if not resource:
        db.rollback()
        raise HTTPException(status_code=404, detail="Resource not found")
    duplicate = db.query(RequestDB).filter(
        RequestDB.resource_id == resource.id,
        RequestDB.recipient_id == user.id,
        RequestDB.status.in_(ACTIVE_STATUSES),
    ).first()
    if duplicate:
        db.rollback()
        raise HTTPException(status_code=409, detail="You already have an active request for this resource")
    request = RequestDB(
        resource_id=resource.id, recipient_id=user.id, quantity=payload.quantity,
        reason=payload.reason.strip(), priority=85 if any(word in payload.reason.lower() for word in ("urgent", "emergency", "critical")) else 50,
        status="Pending", created_at=datetime.utcnow(),
    )
    db.add(request)
    db.flush()
    schedule_resource_queue(db, resource)
    db.commit()
    db.refresh(request)
    return {"request": request_payload(request, db)}


@router.patch("/{request_id}/decision")
def decide_request(
    request_id: int, payload: RequestDecision,
    user: UserDB = Depends(get_current_user), db: Session = Depends(get_db),
):
    db.execute(text("BEGIN IMMEDIATE"))
    request = db.query(RequestDB).filter_by(id=request_id).first()
    resource = db.query(ResourceDB).filter_by(id=request.resource_id).first() if request else None
    if not request or not resource:
        db.rollback()
        raise HTTPException(status_code=404, detail="Request not found")
    if user.role != "admin" and (user.role != "donor" or resource.donor_id != user.id):
        db.rollback()
        raise HTTPException(status_code=403, detail="You cannot manage this request")
    if payload.decision == "approve":
        if request.status != "Allocated":
            db.rollback()
            raise HTTPException(status_code=409, detail="Only allocated requests can be approved")
        request.status = "Reserved"
    elif payload.decision == "reject":
        if request.status not in ACTIVE_STATUSES:
            db.rollback()
            raise HTTPException(status_code=409, detail="This request is already closed")
        if request.status in ("Allocated", "Reserved"):
            resource.quantity += request.quantity
        request.status = "Rejected"
        schedule_resource_queue(db, resource)
    else:
        db.rollback()
        raise HTTPException(status_code=422, detail="Decision must be approve or reject")
    request.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(request)
    return {"request": request_payload(request, db)}