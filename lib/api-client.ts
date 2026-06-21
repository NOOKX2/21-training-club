async function refreshSession(): Promise<boolean> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return res.ok;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (
      res.status === 401 &&
      !retried &&
      !path.startsWith("auth/refresh") &&
      !path.startsWith("auth/login")
    ) {
      const refreshed = await refreshSession();
      if (refreshed) return api<T>(path, options, true);
    }
    const detail =
      typeof data === "object" && data && "detail" in data
        ? String((data as { detail: string }).detail)
        : res.statusText;
    throw new Error(detail);
  }
  return data as T;
}

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  tier_level: string;
  created_at?: string;
  access_starts_at?: string | null;
  access_expires_at?: string | null;
  profile_photo_url?: string | null;
};
