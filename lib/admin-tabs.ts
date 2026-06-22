export const ADMIN_TAB_ROUTES = [
  "/admin",
  "/admin/clients",
  "/admin/chat",
  "/admin/programs",
  "/admin/custom-programs",
  "/admin/results",
  "/admin/weight-verification",
  "/admin/videos",
  "/admin/nutrition",
  "/admin/form-checks",
] as const;

export type AdminTabRoute = (typeof ADMIN_TAB_ROUTES)[number];

export function isAdminTabRoute(pathname: string): pathname is AdminTabRoute {
  return (ADMIN_TAB_ROUTES as readonly string[]).includes(pathname);
}
