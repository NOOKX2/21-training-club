import { NextRequest } from "next/server";
import {
  getAdminClients,
  getAdminClientsForChat,
  getAdminRecentActivity,
  getAdminStats,
  getClientFormChecks,
  getClientWorkoutLogs,
  getCoaches,
  getCustomProgram,
  getExerciseVideos,
  getMessages,
  getNutritionLimits,
  getNutritionMealsForUser,
  getPendingFormChecks,
  getPendingLifts,
  getProgramTemplate,
} from "../data";
import { localDateKey } from "../date-utils";
import { getAdminUser } from "../auth";
import { json, error, handleAuthError } from "../api-helpers";
import {
  parseDay,
  parseProgramTrack,
  parseWeek,
} from "../admin-page-keys";

export async function handleAdminPages(
  req: NextRequest,
  segments: string[]
): Promise<Response> {
  if (req.method !== "GET") {
    return error("Method not allowed", 405);
  }

  try {
    await getAdminUser(req);
    const page = segments[1];
    const params = req.nextUrl.searchParams;

    if (page === "dashboard") {
      const [stats, activity] = await Promise.all([
        getAdminStats(),
        getAdminRecentActivity(),
      ]);
      return json({ stats, activity });
    }

    if (page === "clients") {
      const clients = await getAdminClients();
      return json({ clients });
    }

    if (page === "chat-roster") {
      const coaches = await getCoaches();
      const coachId = coaches[0]?.id ?? "";
      const clients = await getAdminClientsForChat(coachId);
      return json({ coaches, clients, coachId });
    }

    if (page === "chat-messages") {
      const coaches = await getCoaches();
      const coachId = coaches[0]?.id ?? "";
      const clientParam = params.get("client");
      if (!clientParam) {
        return json({ clientId: "", messages: [] as Awaited<ReturnType<typeof getMessages>> });
      }
      const clients = await getAdminClientsForChat(coachId);
      const clientId = clients.some((c) => c.id === clientParam)
        ? clientParam
        : "";
      const messages =
        clientId && coachId ? await getMessages(clientId, coachId) : [];
      return json({ clientId, messages });
    }

    if (page === "chat") {
      const coaches = await getCoaches();
      const coachId = coaches[0]?.id ?? "";
      const clients = await getAdminClientsForChat(coachId);
      const clientParam = params.get("client");
      const selectedClientId =
        clientParam && clients.some((c) => c.id === clientParam)
          ? clientParam
          : (clients[0]?.id ?? "");
      const messages =
        selectedClientId && coachId
          ? await getMessages(selectedClientId, coachId)
          : [];
      return json({
        coaches,
        clients,
        selectedClientId,
        messages,
      });
    }

    if (page === "programs") {
      const track = parseProgramTrack(params.get("track"));
      const day = parseDay(params.get("day"));
      const [program, videos] = await Promise.all([
        getProgramTemplate(track, day),
        getExerciseVideos(),
      ]);
      return json({ track, day, program, videos });
    }

    if (page === "custom-programs") {
      const clients = await getAdminClients();
      const clientParam = params.get("client");
      const selectedEmail =
        clientParam && clients.some((c) => c.email === clientParam)
          ? clientParam
          : "";
      const week = parseWeek(params.get("week"));
      const day = parseDay(params.get("day"));
      const [{ exercises, cardio, rest_day }, videos, initialLimits] =
        await Promise.all([
          selectedEmail
            ? getCustomProgram(selectedEmail, week, day)
            : Promise.resolve({
                exercises: [],
                cardio: null,
                rest_day: false,
              }),
          getExerciseVideos(),
          selectedEmail
            ? getNutritionLimits(selectedEmail)
            : Promise.resolve({}),
        ]);
      return json({
        clients,
        selectedEmail,
        week,
        day,
        initialExercises: exercises,
        initialCardio: cardio,
        initialRestDay: rest_day,
        initialLimits,
        videos,
      });
    }

    if (page === "results") {
      const clients = await getAdminClients();
      const clientParam = params.get("client");
      const selectedClientId =
        clientParam && clients.some((c) => c.id === clientParam)
          ? clientParam
          : "";
      const week = parseWeek(params.get("week"));
      const day = parseDay(params.get("day"));
      const [logs, formChecks] = await Promise.all([
        selectedClientId
          ? getClientWorkoutLogs(selectedClientId, week, day)
          : Promise.resolve([]),
        selectedClientId
          ? getClientFormChecks(selectedClientId, week, day)
          : Promise.resolve([]),
      ]);
      return json({
        clients,
        selectedClientId,
        week,
        day,
        logs,
        formChecks,
      });
    }

    if (page === "weight-verification") {
      const lifts = await getPendingLifts();
      return json({ lifts });
    }

    if (page === "videos") {
      const videos = await getExerciseVideos();
      return json({ videos });
    }

    if (page === "nutrition") {
      const clients = await getAdminClients();
      const clientParam = params.get("client")
        ? decodeURIComponent(params.get("client")!)
        : "";
      const selectedClient = clientParam
        ? clients.find(
            (c) => c.id === clientParam || c.email === clientParam
          )
        : undefined;
      const selectedClientId = selectedClient?.id ?? "";
      const date = params.get("date") ?? localDateKey(new Date());
      const meals = selectedClientId
        ? await getNutritionMealsForUser(selectedClientId, date)
        : [];
      return json({
        clients,
        selectedClientId,
        date,
        meals,
      });
    }

    if (page === "form-checks") {
      const submissions = await getPendingFormChecks();
      return json({ submissions });
    }

    return error("Not found", 404);
  } catch (e) {
    return handleAuthError(e);
  }
}
