from sqlalchemy import func
from sqlalchemy.orm import Session

from models.request import RequestDB
from models.resource import ResourceDB

HOMEPAGE_CATEGORIES = ("Electronics", "Books", "Furniture", "Educational", "Sports", "Materials")


def _normalized_organizations(values: list[str | None]) -> set[str]:
    return {
        value.strip().casefold()
        for value in values
        if value and value.strip()
    }


def get_impact_summary(db: Session) -> dict:
    resources_listed = db.query(ResourceDB.id).count()
    donor_organizations = [row[0] for row in db.query(ResourceDB.donor_org).all()]
    recipient_organizations = [row[0] for row in db.query(RequestDB.recipient_org).all()]
    organizations_represented = len(_normalized_organizations(donor_organizations + recipient_organizations))
    category_quantities = {category: 0 for category in HOMEPAGE_CATEGORIES}
    quantities_by_category = (
        db.query(ResourceDB.category, func.sum(ResourceDB.quantity))
        .group_by(ResourceDB.category)
        .all()
    )
    for category, quantity in quantities_by_category:
        homepage_category = next(
            (known for known in HOMEPAGE_CATEGORIES if known.casefold() == category.strip().casefold()),
            None,
        )
        if homepage_category is not None:
            category_quantities[homepage_category] += int(quantity or 0)

    return {
        "resources_listed": resources_listed,
        "organizations_represented": organizations_represented,
        "completed_donations": None,
        "resource_utilization_percent": None,
        "category_quantities": category_quantities,
    }