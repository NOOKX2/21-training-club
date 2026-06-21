import { NextRequest } from "next/server";
import { getCurrentUser } from "../auth";
import { json, error, handleAuthError } from "../api-helpers";
import { getDailyMuscleStatus } from "../muscle-streak";

export async function handleAppShell(
  req: NextRequest,
  segments: string[]
): Promise<Response> {
  try {
    const user = await getCurrentUser(req);

    if (segments[1] === "muscle-status" && req.method === "GET") {
      const status = await getDailyMuscleStatus(user.id);
      return json(status);
    }
  } catch (e) {
    return handleAuthError(e);
  }
  return error("Not found", 404);
}
