from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.connection import get_db
from models.request import RequestDB
from models.resource import ResourceDB
from models.user import UserDB
from services.security import get_current_user


router = APIRouter(tags=["Activity and Analytics"])


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    month_keys = []
    year, month = now.year, now.month
    for _ in range(6):
        month_keys.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            year -= 1
            month = 12
    month_keys.reverse()
    donation_counts = dict(db.query(func.strftime("%Y-%m", ResourceDB.created_at), func.count(ResourceDB.id))
                          .filter(func.strftime("%Y-%m", ResourceDB.created_at).in_(month_keys))
                          .group_by(func.strftime("%Y-%m", ResourceDB.created_at)).all())
    request_counts = dict(db.query(func.strftime("%Y-%m", RequestDB.created_at), func.count(RequestDB.id))
                          .filter(func.strftime("%Y-%m", RequestDB.created_at).in_(month_keys))
                          .group_by(func.strftime("%Y-%m", RequestDB.created_at)).all())
    resources = db.query(ResourceDB).all()
    initial_units = sum(max(item.initial_quantity, item.quantity) for item in resources)
    available_units = sum(item.quantity for item in resources)
    return {
        "stats": {
            "totalUsers": db.query(func.count(UserDB.id)).scalar() or 0,
            "totalResources": len(resources),
            "pendingRequests": db.query(func.count(RequestDB.id)).filter(RequestDB.status.in_(("Pending", "Waitlisted"))).scalar() or 0,
            "completedDonations": db.query(func.count(RequestDB.id)).filter_by(status="Completed").scalar() or 0,
            "utilizationRate": round(100 * (initial_units - available_units) / initial_units) if initial_units else 0,
        },
        "monthlyDonations": [
            {"month": datetime.strptime(key, "%Y-%m").strftime("%b"), "donations": donation_counts.get(key, 0), "requests": request_counts.get(key, 0)}
            for key in month_keys
        ],
        "categoryDistribution": [
            {"name": name, "value": count}
            for name, count in db.query(ResourceDB.category, func.count(ResourceDB.id)).group_by(ResourceDB.category).order_by(func.count(ResourceDB.id).desc()).all()
        ],
        "statusBreakdown": [
            {"name": name, "value": count}
            for name, count in db.query(ResourceDB.status, func.count(ResourceDB.id)).group_by(ResourceDB.status).all()
        ],
        "mostRequested": [
            {"name": title, "count": count}
            for title, count in db.query(ResourceDB.title, func.count(RequestDB.id))
                .join(RequestDB, RequestDB.resource_id == ResourceDB.id)
                .group_by(ResourceDB.id, ResourceDB.title)
                .order_by(func.count(RequestDB.id).desc()).limit(8).all()
        ],
    }


@router.get("/notifications")
def get_notifications(user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(RequestDB).join(ResourceDB, RequestDB.resource_id == ResourceDB.id)
    if user.role == "recipient":
        query = query.filter(RequestDB.recipient_id == user.id)
    elif user.role == "donor":
        query = query.filter(ResourceDB.donor_id == user.id)
    rows = query.order_by(RequestDB.created_at.desc(), RequestDB.id.desc()).limit(100).all()
    items = []
    for request in rows:
        resource = db.query(ResourceDB).filter_by(id=request.resource_id).first()
        recipient = db.query(UserDB).filter_by(id=request.recipient_id).first()
        if user.role == "donor":
            message = f"{recipient.organization if recipient else 'A recipient'} requested {request.quantity} × {resource.title if resource else 'a resource'}. Status: {request.status}."
        else:
            message = f"Your request for {request.quantity} × {resource.title if resource else 'a resource'} is {request.status.lower()}."
        items.append({
            "id": request.id,
            "title": f"Request {request.status}",
            "message": message,
            "type": request.status.lower(),
            "read": False,
            "createdAt": request.created_at.isoformat(),
        })
    return {"notifications": items}