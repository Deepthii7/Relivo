from datetime import datetime

from sqlalchemy.orm import Session

from models.request import RequestDB
from models.resource import ResourceDB


QUEUE_STATUSES = ("Pending", "Waitlisted")
ACTIVE_STATUSES = ("Pending", "Waitlisted", "Allocated", "Reserved")
AGING_POINTS_PER_DAY = 5


def effective_priority(request: RequestDB, now: datetime | None = None) -> int:
    now = now or datetime.utcnow()
    age_days = max(0, (now - request.created_at).days)
    return min(100, request.priority + age_days * AGING_POINTS_PER_DAY)


def schedule_resource_queue(db: Session, resource: ResourceDB) -> None:
    queue = db.query(RequestDB).filter(
        RequestDB.resource_id == resource.id,
        RequestDB.status.in_(QUEUE_STATUSES),
    ).all()
    queue.sort(key=lambda item: (-effective_priority(item), item.created_at, item.id))

    for request in queue:
        if request.quantity <= resource.quantity:
            resource.quantity -= request.quantity
            request.status = "Allocated"
        else:
            request.status = "Waitlisted"
    resource.status = "Available" if resource.quantity > 0 else "Allocated"