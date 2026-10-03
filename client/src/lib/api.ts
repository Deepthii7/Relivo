import type { Request, Resource, RequestStatus } from "@/lib/mockData";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface ApiResource {
  id: number;
  name: string;
  category: string;
  description: string;
  condition: Resource["condition"];
  quantity: number;
  location: string;
  status: Resource["status"];
  donor_id: number | null;
  donor_name: string;
  donor_org: string;
  image_url?: string | null;
  uploaded_days_ago: number;
  requested_count: number;
}

interface ApiRequest {
  id: number;
  resource_id: number;
  resource_title: string;
  donor_id: number | null;
  recipient_id: number;
  recipient_name: string;
  recipient_org: string;
  quantity: number;
  reason: string;
  urgency: "low" | "normal" | "high";
  base_priority: number;
  effective_priority?: number;
  status: RequestStatus;
  created_at: string;
}

interface ApiRecommendation {
  id: string;
  source_request_id: number;
  resource_id: number;
  resource_title: string;
  available_quantity: number;
  donor_name: string;
  donor_org: string;
  recipient_id: number;
  recipient_name: string;
  recipient_org: string;
  quantity_required: number;
  urgency: "low" | "normal" | "high";
  demand_level: "High" | "Medium" | "Low";
  demand_request_count: number;
  score: number;
  score_components: {
    category_fit: number;
    quantity_fit: number;
    urgency_fit: number;
  };
  reasons: string[];
  distance_km: number | null;
  previous_donations: number | null;
}

export interface Recommendation {
  id: string;
  sourceRequestId: number;
  resourceId: number;
  resourceTitle: string;
  availableQuantity: number;
  donorName: string;
  donorOrg: string;
  recipientId: number;
  recipientName: string;
  recipientOrg: string;
  quantityRequired: number;
  urgency: "low" | "normal" | "high";
  demandLevel: "High" | "Medium" | "Low";
  demandRequestCount: number;
  score: number;
  scoreComponents: ApiRecommendation["score_components"];
  reasons: string[];
  distanceKm: number | null;
  previousDonations: number | null;
}

export interface ImpactSummary {
  resourcesListed: number;
  organizationsRepresented: number;
  completedDonations: number | null;
  resourceUtilizationPercent: number | null;
  categoryQuantities: Record<string, number>;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail ?? "The request could not be completed.");
  }
  return body as T;
}

function toResource(resource: ApiResource): Resource {
  return {
    id: resource.id,
    title: resource.name,
    category: resource.category,
    description: resource.description,
    quantity: resource.quantity,
    condition: resource.condition,
    location: resource.location,
    distanceKm: undefined,
    status: resource.status,
    donorId: resource.donor_id ?? 0,
    donorName: resource.donor_name,
    donorOrg: resource.donor_org,
    uploadedDaysAgo: resource.uploaded_days_ago,
    imageUrl: resource.image_url ?? undefined,
    requestedCount: resource.requested_count,
  };
}

function toRequest(request: ApiRequest): Request {
  return {
    id: request.id,
    resourceId: request.resource_id,
    resourceTitle: request.resource_title,
    recipientId: request.recipient_id,
    recipientName: request.recipient_name,
    recipientOrg: request.recipient_org,
    quantity: request.quantity,
    priority: request.effective_priority ?? request.base_priority,
    status: request.status,
    reason: request.reason,
    createdAt: request.created_at,
    donorId: request.donor_id ?? 0,
  };
}

export async function getResources(): Promise<Resource[]> {
  const result = await apiRequest<{ resources: ApiResource[] }>("/resources");
  return result.resources.map(toResource);
}

export async function getImpactSummary(): Promise<ImpactSummary> {
  const result = await apiRequest<{
    resources_listed: number;
    organizations_represented: number;
    completed_donations: number | null;
    resource_utilization_percent: number | null;
    category_quantities: Record<string, number>;
  }>("/analytics/summary");
  return {
    resourcesListed: result.resources_listed,
    organizationsRepresented: result.organizations_represented,
    completedDonations: result.completed_donations,
    resourceUtilizationPercent: result.resource_utilization_percent,
    categoryQuantities: result.category_quantities,
  };
}

export async function getRecommendations(recipientId?: number): Promise<Recommendation[]> {
  const query = recipientId === undefined ? "" : `?recipient_id=${recipientId}`;
  const result = await apiRequest<{ recommendations: ApiRecommendation[] }>(`/recommendations${query}`);
  return result.recommendations.map((recommendation) => ({
    id: recommendation.id,
    sourceRequestId: recommendation.source_request_id,
    resourceId: recommendation.resource_id,
    resourceTitle: recommendation.resource_title,
    availableQuantity: recommendation.available_quantity,
    donorName: recommendation.donor_name,
    donorOrg: recommendation.donor_org,
    recipientId: recommendation.recipient_id,
    recipientName: recommendation.recipient_name,
    recipientOrg: recommendation.recipient_org,
    quantityRequired: recommendation.quantity_required,
    urgency: recommendation.urgency,
    demandLevel: recommendation.demand_level,
    demandRequestCount: recommendation.demand_request_count,
    score: recommendation.score,
    scoreComponents: recommendation.score_components,
    reasons: recommendation.reasons,
    distanceKm: recommendation.distance_km,
    previousDonations: recommendation.previous_donations,
  }));
}

export async function getResource(id: number): Promise<Resource> {
  const result = await apiRequest<{ resource: ApiResource }>(`/resources/${id}`);
  return toResource(result.resource);
}

export async function createResource(payload: {
  name: string;
  category: string;
  quantity: number;
  location: string;
  description: string;
  condition: string;
  donor_id: number;
  donor_name: string;
  donor_org: string;
}): Promise<Resource> {
  const result = await apiRequest<{ resource: ApiResource }>("/resources", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toResource(result.resource);
}

export async function createRequest(payload: {
  resource_id: number;
  recipient_id: number;
  recipient_name: string;
  recipient_org: string;
  quantity: number;
  reason: string;
  urgency: "low" | "normal" | "high";
}): Promise<Request> {
  const result = await apiRequest<{ request: ApiRequest }>("/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return toRequest(result.request);
}

export async function getRequests(filters: { recipientId?: number; donorId?: number } = {}): Promise<Request[]> {
  const query = new URLSearchParams();
  if (filters.recipientId !== undefined) query.set("recipient_id", String(filters.recipientId));
  if (filters.donorId !== undefined) query.set("donor_id", String(filters.donorId));
  const suffix = query.toString();
  const result = await apiRequest<{ requests: ApiRequest[] }>(`/requests${suffix ? `?${suffix}` : ""}`);
  return result.requests.map(toRequest);
}

export async function decideRequest(
  id: number,
  decision: "approve" | "reject",
): Promise<Request> {
  const result = await apiRequest<{ request: ApiRequest }>(
    `/requests/${id}/decision`,
    { method: "PATCH", body: JSON.stringify({ decision }) },
  );
  return toRequest(result.request);
}