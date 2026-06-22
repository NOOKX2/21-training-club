export const MAIN_TAB_ROUTES = [
  "/workouts",
  "/nutrition",
  "/progress",
  "/coach",
] as const;

export type MainTabRoute = (typeof MAIN_TAB_ROUTES)[number];

export function isMainTabRoute(pathname: string): pathname is MainTabRoute {
  return (MAIN_TAB_ROUTES as readonly string[]).includes(pathname);
}
