from collections import Counter
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from algorithms.matching import find_matches
from algorithms.recommendation_scoring import score_resource
from models.request import RequestDB
from models.resource import ResourceDB


ACTIVE_REQUEST_STATUSES = {"Pending", "Waitlisted", "Approved", "Reserved", "Pickup Scheduled"}


def _demand_level(request_count: int) -> str:
    if request_count >= 5:
        return "High"
    if request_count >= 2:
        return "Medium"
    return "Low"


def _recommend_for_recipient(db: Session, recipient_id: int) -> list[dict]:
    recipient_requests = (
        db.query(RequestDB)
        .filter(RequestDB.recipient_id == recipient_id)
        .order_by(RequestDB.created_at.desc(), RequestDB.id.desc())
        .all()
    )
    if not recipient_requests:
        return []

    latest_request_by_category = {}
    excluded_resource_ids = set()
    for request in recipient_requests:
        category = request.resource.category
        latest_request_by_category.setdefault(category, request)
        if request.status in ACTIVE_REQUEST_STATUSES:
            excluded_resource_ids.add(request.resource_id)

    demand_requests = (
        db.query(RequestDB)
        .join(ResourceDB)
        .filter(RequestDB.status != "Rejected")
        .all()
    )
    demand_by_category = Counter(request.resource.category for request in demand_requests)
    available_resources = db.query(ResourceDB).filter(ResourceDB.quantity > 0).all()

    recommendations = []
    for category, source_request in latest_request_by_category.items():
        candidates = find_matches(available_resources, category, location=None)
        for resource in candidates:
            if resource.id in excluded_resource_ids:
                continue

            scoring = score_resource(
                resource_category=resource.category,
                requested_category=category,
                available_quantity=resource.quantity,
                requested_quantity=source_request.quantity,
                urgency=source_request.urgency,
            )
            category_demand = demand_by_category[category]
            quantity_coverage = scoring["score_components"]["quantity_fit"]
            if quantity_coverage >= 1:
                quantity_reason = f"Available quantity ({resource.quantity}) covers the requested quantity ({source_request.quantity})."
            else:
                quantity_reason = f"Available quantity ({resource.quantity}) covers {round(quantity_coverage * 100)}% of the requested quantity ({source_request.quantity})."

            recommendations.append({
                "id": f"{recipient_id}:{source_request.id}:{resource.id}",
                "source_request_id": source_request.id,
                "resource_id": resource.id,
                "resource_title": resource.name,
                "available_quantity": resource.quantity,
                "donor_name": resource.donor_name or "RELIVO Donor",
                "donor_org": resource.donor_org or "Community Donor",
                "recipient_id": recipient_id,
                "recipient_name": source_request.recipient_name,
                "recipient_org": source_request.recipient_org,
                "quantity_required": source_request.quantity,
                "urgency": source_request.urgency,
                "demand_level": _demand_level(category_demand),
                "demand_request_count": category_demand,
                **scoring,
                "reasons": [
                    f"Matches the {category} category in your request history.",
                    quantity_reason,
                    f"Uses {source_request.urgency} urgency from your latest request in this category.",
                ],
                "distance_km": None,
                "previous_donations": None,
            })

    recommendations.sort(key=lambda item: (-item["score"], item["resource_id"], item["source_request_id"]))
    return recommendations


def generate_recommendations(db: Session, recipient_id: int | None = None) -> dict:
    if recipient_id is None:
        recipient_ids = [
            row[0]
            for row in db.query(RequestDB.recipient_id).distinct().order_by(RequestDB.recipient_id).all()
        ]
    else:
        recipient_ids = [recipient_id]

    recommendations = []
    for current_recipient_id in recipient_ids:
        recommendations.extend(_recommend_for_recipient(db, current_recipient_id))
    recommendations.sort(key=lambda item: (-item["score"], item["recipient_id"], item["resource_id"], item["source_request_id"]))
    return {
        "recipient_id": recipient_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "recommendations": recommendations,
    }