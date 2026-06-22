/** Update the URL without triggering a Next.js navigation / SSR refetch. */
export function replaceAppUrl(
  pathname: string,
  params: Record<string, string | number | undefined | null>
) {
  if (typeof window === "undefined") return;
  const url = new URL(pathname, window.location.origin);
  url.search = "";
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  const next = url.pathname + url.search;
  window.history.replaceState(null, "", next);
}
