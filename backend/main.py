from datetime import datetime, timezone
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from algorithms.matching import find_matches
from database.connection import Base, engine, get_db
from models.request import RequestDB
from models.resource import ResourceDB
from schemas.impact_summary import ImpactSummary
from schemas.recommendation import RecommendationResponse
from services.impact_summary import get_impact_summary
from services.recommendation_service import generate_recommendations
from services.request_workflow import URGENCY_PRIORITIES, decide_request, schedule_requests


def add_resource_columns():
    if engine.dialect.name != "sqlite" or not inspect(engine).has_table("resources"):
        return

    existing_columns = {column["name"] for column in inspect(engine).get_columns("resources")}
    additions = {
        "description": "TEXT",
        "condition": "VARCHAR",
        "donor_id": "INTEGER",
        "donor_name": "VARCHAR",
        "donor_org": "VARCHAR",
        "image_url": "VARCHAR",
        "created_at": "DATETIME",
    }
    with engine.begin() as connection:
        for column_name, column_type in additions.items():
            if column_name not in existing_columns:
                connection.execute(
                    text(f"ALTER TABLE resources ADD COLUMN {column_name} {column_type}")
                )


add_resource_columns()
Base.metadata.create_all(bind=engine)

# Create Relivo application
app = FastAPI(title="Relivo")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)


class Resource(BaseModel):
    name: str = Field(min_length=1)
    category: str = Field(min_length=1)
    quantity: int = Field(gt=0)
    location: str = Field(min_length=1)
    description: str = ""
    condition: str = "Good"
    donor_id: int | None = None
    donor_name: str = ""
    donor_org: str = ""
    image_url: str | None = None


class ResourceRequest(BaseModel):
    resource_id: int = Field(gt=0)
    recipient_id: int = Field(gt=0)
    recipient_name: str = Field(min_length=1)
    recipient_org: str = Field(min_length=1)
    quantity: int = Field(gt=0)
    reason: str = Field(min_length=10)
    urgency: Literal["low", "normal", "high"] = "normal"


class RequestDecision(BaseModel):
    decision: Literal["approve", "reject"]


@app.get("/")
def root():
    return {
        "message": "Relivo AI backend is running!"
    }


@app.post("/resources", status_code=201)
def add_resource(resource: Resource, db: Session = Depends(get_db)):
    new_resource = ResourceDB(
        name=resource.name,
        category=resource.category,
        quantity=resource.quantity,
        location=resource.location,
        description=resource.description,
        condition=resource.condition,
        donor_id=resource.donor_id,
        donor_name=resource.donor_name,
        donor_org=resource.donor_org,
        image_url=resource.image_url,
        created_at=datetime.now(timezone.utc),
    )

    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    return {
        "message": "Resource added successfully!",
        "resource": serialize_resource(new_resource)
    }


@app.get("/resources")
def get_all_resources(db: Session = Depends(get_db)):
    resources = db.query(ResourceDB).order_by(ResourceDB.id.desc()).all()
    return {"resources": [serialize_resource(resource) for resource in resources]}


def serialize_resource(resource: ResourceDB) -> dict:
    return {
        "id": resource.id,
        "name": resource.name,
        "title": resource.name,
        "category": resource.category,
        "quantity": resource.quantity,
        "location": resource.location,
        "description": resource.description or "",
        "condition": resource.condition or "Good",
        "donor_id": resource.donor_id,
        "donor_name": resource.donor_name or "RELIVO Donor",
        "donor_org": resource.donor_org or "Community Donor",
        "image_url": resource.image_url,
        "uploaded_days_ago": 0,
        "requested_count": 0,
        "status": "Available" if resource.quantity > 0 else "Allocated",
    }


@app.get("/resources/search")
def search_resources(
    name: str | None = None,
    category: str | None = None,
    location: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(ResourceDB)

    if name:
        query = query.filter(
            ResourceDB.name.ilike(f"%{name}%")
        )

    if category:
        query = query.filter(
            ResourceDB.category.ilike(category)
        )

    if location:
        query = query.filter(
            ResourceDB.location.ilike(location)
        )

    resources = query.all()

    return {"resources": [serialize_resource(resource) for resource in resources]}


@app.get("/resources/match")
def match_resources(category: str, location: str, db: Session = Depends(get_db)):
    resources = db.query(ResourceDB).all()

    matches = find_matches(
        resources,
        category,
        location
    )

    return {"matches": [serialize_resource(resource) for resource in matches]}


@app.get("/resources/{resource_id}")
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(ResourceDB).filter(ResourceDB.id == resource_id).first()
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"resource": serialize_resource(resource)}


@app.get("/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    recipient_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
):
    return generate_recommendations(db, recipient_id)


@app.get("/analytics/summary", response_model=ImpactSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    return get_impact_summary(db)


def serialize_request(request: RequestDB, priority: float | None = None) -> dict:
    result = {
        "id": request.id,
        "resource_id": request.resource_id,
        "resource_title": request.resource.name,
        "donor_id": request.resource.donor_id,
        "recipient_id": request.recipient_id,
        "recipient_name": request.recipient_name,
        "recipient_org": request.recipient_org,
        "quantity": request.quantity,
        "reason": request.reason,
        "urgency": request.urgency,
        "base_priority": request.base_priority,
        "status": request.status,
        "created_at": request.created_at,
    }
    if priority is not None:
        result["effective_priority"] = round(priority, 2)
    return result


@app.post("/requests", status_code=201)
def create_request(payload: ResourceRequest, db: Session = Depends(get_db)):
    resource = db.query(ResourceDB).filter(ResourceDB.id == payload.resource_id).first()
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    if payload.quantity > resource.quantity:
        raise HTTPException(status_code=409, detail="Requested quantity is not currently available")

    request = RequestDB(
        resource_id=payload.resource_id,
        recipient_id=payload.recipient_id,
        recipient_name=payload.recipient_name,
        recipient_org=payload.recipient_org,
        quantity=payload.quantity,
        reason=payload.reason,
        urgency=payload.urgency,
        base_priority=URGENCY_PRIORITIES[payload.urgency],
        status="Pending",
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return {"request": serialize_request(request)}


@app.get("/requests")
def get_requests(
    recipient_id: int | None = None,
    donor_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(RequestDB)
    if recipient_id is not None:
        query = query.filter(RequestDB.recipient_id == recipient_id)
    if donor_id is not None:
        query = query.join(ResourceDB).filter(ResourceDB.donor_id == donor_id)

    requests = query.all()
    queued = [request for request in requests if request.status in ("Pending", "Waitlisted")]
    completed = [request for request in requests if request.status not in ("Pending", "Waitlisted")]
    scheduled = schedule_requests(queued)
    return {
        "requests": [
            serialize_request(request, priority)
            for request, priority in scheduled
        ] + [serialize_request(request) for request in completed]
    }


@app.get("/requests/queue")
def get_request_queue(db: Session = Depends(get_db)):
    queued = db.query(RequestDB).filter(RequestDB.status.in_(("Pending", "Waitlisted"))).all()
    return {
        "requests": [
            serialize_request(request, priority)
            for request, priority in schedule_requests(queued)
        ]
    }


@app.patch("/requests/{request_id}/decision")
def update_request_decision(
    request_id: int,
    payload: RequestDecision,
    db: Session = Depends(get_db),
):
    request = decide_request(db, request_id, payload.decision)
    if request is None:
        exists = db.query(RequestDB.id).filter(RequestDB.id == request_id).first()
        if exists is None:
            raise HTTPException(status_code=404, detail="Request not found")
        raise HTTPException(status_code=409, detail="Request is no longer queued")

    message = "Request approved and inventory allocated"
    if request.status == "Waitlisted":
        message = "Insufficient inventory; request remains in the queue"
    elif request.status == "Rejected":
        message = "Request rejected"
    return {"message": message, "request": serialize_request(request)}