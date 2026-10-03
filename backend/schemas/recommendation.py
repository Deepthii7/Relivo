from typing import Literal

from pydantic import BaseModel, Field


class RecommendationScoreComponents(BaseModel):
    category_fit: float = Field(ge=0, le=1)
    quantity_fit: float = Field(ge=0, le=1)
    urgency_fit: float = Field(ge=0, le=1)


class Recommendation(BaseModel):
    id: str
    source_request_id: int
    resource_id: int
    resource_title: str
    available_quantity: int
    donor_name: str
    donor_org: str
    recipient_id: int
    recipient_name: str
    recipient_org: str
    quantity_required: int
    urgency: Literal["low", "normal", "high"]
    demand_level: Literal["High", "Medium", "Low"]
    demand_request_count: int
    score: int = Field(ge=0, le=100)
    score_components: RecommendationScoreComponents
    reasons: list[str]
    distance_km: float | None = None
    previous_donations: int | None = None


class RecommendationResponse(BaseModel):
    recipient_id: int | None
    generated_at: str
    recommendations: list[Recommendation]