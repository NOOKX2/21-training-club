import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getDb } from "./db";
import { checkUserAccess } from "./access";
import { isAdminRole, normalizeRole } from "./routes";

const JWT_ALGORITHM = "HS256";

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, bcrypt.genSaltSync());
}

export function verifyPassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

export function createAccessToken(userId: string, email: string): string {
  return jwt.sign(
    {
      sub: userId,
      email,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + 15 * 60,
    },
    jwtSecret(),
    { algorithm: JWT_ALGORITHM }
  );
}

export function createRefreshToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    },
    jwtSecret(),
    { algorithm: JWT_ALGORITHM }
  );
}

export type AuthUser = {
  id: string;
  _id: string;
  email: string;
  name: string;
  role: string;
  tier_level: string;
  fitness_goal?: string;
  height?: number;
  profile_image?: string;
  assigned_meal_plan?: string;
  created_at?: string;
  gender?: string;
  access_starts_at?: string;
  access_expires_at?: string | null;
};

function sanitizeUser(doc: Record<string, unknown>): AuthUser {
  const id = String(doc._id);
  const { password_hash: _, ...rest } = doc;
  return {
    ...rest,
    id,
    _id: id,
    email: String(rest.email ?? ""),
    name: String(rest.name ?? ""),
    role: normalizeRole(rest.role),
    tier_level: String(rest.tier_level ?? "Tier 1"),
  } as AuthUser;
}

export async function getTokenFromRequest(req: NextRequest): Promise<string | null> {
  let token = req.cookies.get("access_token")?.value ?? null;
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get("access_token")?.value ?? null;
  }
  if (!token) {
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) token = auth.slice(7);
  }
  return token;
}

export async function getCurrentUser(req: NextRequest): Promise<AuthUser> {
  const token = await getTokenFromRequest(req);
  if (!token) throw new AuthError("Not authenticated", 401);

  try {
    const payload = jwt.verify(token, jwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    }) as jwt.JwtPayload;
    if (payload.type !== "access") throw new AuthError("Invalid token type", 401);

    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.sub as string) });
    if (!user) throw new AuthError("User not found", 401);
    const access = checkUserAccess(user as Record<string, unknown>);
    if (!access.active) {
      throw new AuthError(access.message ?? "Account access denied", 403);
    }
    return sanitizeUser(user as Record<string, unknown>);
  } catch (e) {
    if (e instanceof AuthError) throw e;
    if (e instanceof jwt.TokenExpiredError) {
      throw new AuthError("Token expired", 401);
    }
    throw new AuthError("Invalid token", 401);
  }
}

export async function getAdminUser(req: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!isAdminRole(user.role)) throw new AuthError("Admin access required", 403);
  return user;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
