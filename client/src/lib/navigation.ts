import type { Role } from "@/lib/mockData";

export function getPostAuthPath(role: Role, requestedPath: string | null): string {
  if ((role === "recipient" || role === "admin") && requestedPath && /^\/request\/\d+$/.test(requestedPath)) {
    return requestedPath;
  }
  return role === "admin" ? "/admin" : role === "donor" ? "/donor" : "/recipient";
}