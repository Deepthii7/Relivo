URGENCY_FIT = {"low": 0.25, "normal": 0.5, "high": 1.0}
CATEGORY_WEIGHT = 0.4
QUANTITY_WEIGHT = 0.4
URGENCY_WEIGHT = 0.2


def score_resource(
    *,
    resource_category: str,
    requested_category: str,
    available_quantity: int,
    requested_quantity: int,
    urgency: str,
) -> dict:
    category_fit = float(resource_category.strip().casefold() == requested_category.strip().casefold())
    quantity_fit = min(max(available_quantity, 0) / requested_quantity, 1.0) if requested_quantity > 0 else 0.0
    urgency_fit = URGENCY_FIT[urgency]
    score = round(100 * (
        CATEGORY_WEIGHT * category_fit
        + QUANTITY_WEIGHT * quantity_fit
        + URGENCY_WEIGHT * urgency_fit
    ))

    return {
        "score": score,
        "score_components": {
            "category_fit": category_fit,
            "quantity_fit": round(quantity_fit, 4),
            "urgency_fit": urgency_fit,
        },
    }