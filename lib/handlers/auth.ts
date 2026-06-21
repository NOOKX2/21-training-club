import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { getDb } from "../db";
import {
  hashPassword,
  verifyPassword,
  getCurrentUser,
  refreshAccessToken,
  AUTH_COOKIE_OPTIONS,
} from "../auth";
import { checkUserAccess } from "../access";
import { isAdminRole } from "../routes";
import {
  json,
  error,
  withAuthCookies,
  clearAuthCookies,
  parseBody,
  handleAuthError,
} from "../api-helpers";

export async function handleAuth(
  req: NextRequest,
  segments: string[]
): Promise<Response> {
  const action = segments[1];

  try {
    if (action === "register" && req.method === "POST") {
      const body = await parseBody<{
        name: string;
        email: string;
        password: string;
        confirm_password: string;
        fitness_goal?: string;
      }>(req);
      if (body.password !== body.confirm_password) {
        return error("Passwords do not match", 400);
      }
      const email = body.email.toLowerCase();
      const db = await getDb();
      const existing = await db.collection("users").findOne({ email });
      if (existing) return error("Email already registered", 400);

      const userCount = await db.collection("users").countDocuments({});
      if (userCount > 0) {
        return error(
          "Registration is disabled. Please contact your coach for access.",
          403
        );
      }

      const role = "admin";
      const tier_level = "Admin";
      const result = await db.collection("users").insertOne({
        email,
        name: body.name,
        password_hash: hashPassword(body.password),
        role,
        tier_level,
        fitness_goal: body.fitness_goal ?? null,
        created_at: new Date().toISOString(),
      });
      const userId = String(result.insertedId);
      return withAuthCookies(
        { id: userId, email, name: body.name, role, tier_level },
        userId,
        email
      );
    }

    if (action === "login" && req.method === "POST") {
      const body = await parseBody<{ email: string; password: string }>(req);
      const email = body.email.toLowerCase();
      const db = await getDb();
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
      const identifier = `${ip}:${email}`;
      const attempts = await db.collection("login_attempts").findOne({ identifier });
      if (attempts && (attempts.count as number) >= 5) {
        const locked = attempts.locked_until as string | undefined;
        if (locked && new Date(locked) > new Date()) {
          return error("Too many failed attempts. Try again in 15 minutes.", 429);
        }
      }

      const user = await db.collection("users").findOne({ email });
      if (!user || !verifyPassword(body.password, user.password_hash as string)) {
        await db.collection("login_attempts").updateOne(
          { identifier },
          {
            $inc: { count: 1 },
            $set: {
              locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            },
          },
          { upsert: true }
        );
        return error("Invalid email or password", 401);
      }

      await db.collection("login_attempts").deleteOne({ identifier });

      if (!isAdminRole(String(user.role ?? "user"))) {
        const access = checkUserAccess(user as Record<string, unknown>);
        if (!access.active) {
          return error(access.message ?? "Account access denied", 403);
        }
      }

      const userId = String(user._id);
      return withAuthCookies(
        {
          id: userId,
          email: user.email,
          name: user.name,
          role: user.role ?? "user",
          tier_level: user.tier_level ?? "Tier 1",
        },
        userId,
        email
      );
    }

    if (action === "logout" && req.method === "POST") {
      return clearAuthCookies();
    }

    if (action === "refresh" && req.method === "POST") {
      const refreshed = await refreshAccessToken(req);
      if (!refreshed) return error("Not authenticated", 401);
      const res = json({ message: "Token refreshed" });
      res.cookies.set("access_token", refreshed.accessToken, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 900,
      });
      return res;
    }

    if (action === "me" && req.method === "GET") {
      const user = await getCurrentUser(req);
      return json(user);
    }

    if (action === "registration-status" && req.method === "GET") {
      const db = await getDb();
      const count = await db.collection("users").countDocuments({});
      return json({ registration_enabled: count === 0 });
    }
  } catch (e) {
    return handleAuthError(e);
  }

  return error("Not found", 404);
}

export async function handleUserProfile(req: NextRequest): Promise<Response> {
  try {
    const user = await getCurrentUser(req);
    const body = await parseBody<{
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    }>(req);
    const db = await getDb();
    const update: Record<string, string> = {};

    if (body.name) update.name = body.name;
    if (body.email && body.email !== user.email) {
      const existing = await db.collection("users").findOne({
        email: body.email.toLowerCase(),
      });
      if (existing && String(existing._id) !== user.id) {
        return error("Email already in use", 400);
      }
      update.email = body.email.toLowerCase();
    }
    if (body.newPassword && body.currentPassword) {
      const doc = await db.collection("users").findOne({
        _id: new ObjectId(user.id),
      });
      if (!doc) return error("User not found", 404);
      if (!verifyPassword(body.currentPassword, doc.password_hash as string)) {
        return error("Current password is incorrect", 400);
      }
      update.password_hash = hashPassword(body.newPassword);
    }

    if (Object.keys(update).length > 0) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(user.id) },
        { $set: update }
      );
    }

    const updated = await db.collection("users").findOne(
      { _id: new ObjectId(user.id) },
      { projection: { password_hash: 0 } }
    );
    return json({
      id: user.id,
      name: updated?.name,
      email: updated?.email,
      role: updated?.role,
      tier_level: updated?.tier_level,
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
