import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "./db";
import type { User } from "./api-client";
import { ADMIN_HOME, USER_HOME, isAdminRole, normalizeRole } from "./routes";

async function userFromToken(token: string): Promise<User | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    if (payload.type !== "access" || !payload.sub) return null;
    const db = await getDb();
    const doc = await db.collection("users").findOne({
      _id: new ObjectId(payload.sub as string),
    });
    if (!doc) return null;
    return {
      id: String(doc._id),
      email: String(doc.email),
      name: String(doc.name),
      role: normalizeRole(doc.role),
      tier_level: String(doc.tier_level ?? "Tier 1"),
      created_at: doc.created_at ? String(doc.created_at) : undefined,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return userFromToken(token);
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** app/(app) — block admin; they belong in app/(admin) */
export async function requireAppUser(): Promise<User> {
  const user = await requireUser();
  if (isAdminRole(user.role)) redirect(ADMIN_HOME);
  return user;
}

/** app/(admin) — block regular users */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!isAdminRole(user.role)) redirect(USER_HOME);
  return user;
}
