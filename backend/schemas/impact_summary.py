from pydantic import BaseModel, Field


class ImpactSummary(BaseModel):
    resources_listed: int = Field(ge=0)
    organizations_represented: int = Field(ge=0)
    completed_donations: int | None = Field(default=None, ge=0)
    resource_utilization_percent: float | None = Field(default=None, ge=0, le=100)
    category_quantities: dict[str, int]