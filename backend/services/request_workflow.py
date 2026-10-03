from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models.request import RequestDB
from models.resource import ResourceDB


URGENCY_PRIORITIES = {"low": 25, "normal": 50, "high": 100}
QUEUED_STATUSES = ("Pending", "Waitlisted")
AGING_POINTS_PER_HOUR = 1


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def effective_priority(request: RequestDB, now: datetime | None = None) -> float:
    current_time = _as_utc(now or datetime.now(timezone.utc))
    created_at = _as_utc(request.created_at)
    waited_hours = max((current_time - created_at).total_seconds(), 0) / 3600
    return request.base_priority + waited_hours * AGING_POINTS_PER_HOUR


def schedule_requests(
    requests: list[RequestDB], now: datetime | None = None
) -> list[tuple[RequestDB, float]]:
    scheduled = [(request, effective_priority(request, now)) for request in requests]
    return sorted(
        scheduled,
        key=lambda item: (-item[1], _as_utc(item[0].created_at), item[0].id or 0),
    )


def decide_request(db: Session, request_id: int, decision: str) -> RequestDB | None:
    if decision not in ("approve", "reject"):
        raise ValueError("decision must be approve or reject")

    claimed = (
        db.query(RequestDB)
        .filter(RequestDB.id == request_id, RequestDB.status.in_(QUEUED_STATUSES))
        .update({RequestDB.status: "Allocating"}, synchronize_session=False)
    )
    if not claimed:
        db.rollback()
        return None

    request = db.query(RequestDB).filter(RequestDB.id == request_id).one()
    if decision == "reject":
        request.status = "Rejected"
    else:
        allocated = (
            db.query(ResourceDB)
            .filter(
                ResourceDB.id == request.resource_id,
                ResourceDB.quantity >= request.quantity,
            )
            .update(
                {ResourceDB.quantity: ResourceDB.quantity - request.quantity},
                synchronize_session=False,
            )
        )
        request.status = "Approved" if allocated else "Waitlisted"

    db.commit()
    db.refresh(request)
    return request