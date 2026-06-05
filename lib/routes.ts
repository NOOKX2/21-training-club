/** Entry for app/(admin) route group */
export const ADMIN_HOME = "/admin";

/** Entry for app/(app) route group */
export const USER_HOME = "/workouts";

/** Strip stray quotes from Atlas manual edits */
export function normalizeRole(role: unknown): string {
  return String(role ?? "user")
    .trim()
    .replace(/"/g, "");
}

export function isAdminRole(role: string): boolean {
  return normalizeRole(role).toLowerCase() === "admin";
}

export function homePathForRole(role: string): string {
  return isAdminRole(role) ? ADMIN_HOME : USER_HOME;
}
