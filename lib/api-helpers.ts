import { NextRequest, NextResponse } from "next/server";
import { AuthError, AUTH_COOKIE_OPTIONS, createAccessToken, createRefreshToken } from "./auth";

export function json(data: unknown, status = 200, init?: ResponseInit) {
  return NextResponse.json(data, { status, ...init });
}

export function error(detail: string, status: number) {
  return NextResponse.json({ detail }, { status });
}

export function withAuthCookies(
  body: unknown,
  userId: string,
  email: string
): NextResponse {
  const access = createAccessToken(userId, email);
  const refresh = createRefreshToken(userId);
  const res = NextResponse.json(body);
  res.cookies.set("access_token", access, { ...AUTH_COOKIE_OPTIONS, maxAge: 900 });
  res.cookies.set("refresh_token", refresh, { ...AUTH_COOKIE_OPTIONS, maxAge: 604800 });
  return res;
}

export function clearAuthCookies(): NextResponse {
  const res = NextResponse.json({ message: "Logged out successfully" });
  res.cookies.delete("access_token");
  res.cookies.delete("refresh_token");
  return res;
}

export async function parseBody<T = Record<string, unknown>>(
  req: NextRequest
): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

export function handleAuthError(e: unknown): NextResponse {
  if (e instanceof AuthError) return error(e.message, e.status);
  console.error(e);
  return error("Internal server error", 500);
}
