import { headers } from "next/headers";
import {
  adminChatMessagesKey,
  adminChatRosterKey,
  adminClientsKey,
  adminCustomProgramsKey,
  adminDashboardKey,
  adminFormChecksKey,
  adminNutritionKey,
  adminProgramsKey,
  adminResultsKey,
  adminVideosKey,
  adminWeightVerificationKey,
  parseDay,
  parseProgramTrack,
  parseWeek,
} from "@/lib/admin-page-keys";
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
} from "@/lib/data";
import { localDateKey } from "@/lib/date-utils";

async function parseRequestUrl() {
  const headersList = await headers();
  const rawUrl = headersList.get("x-url") ?? "/admin";
  return new URL(rawUrl, "http://localhost");
}

export async function buildAdminSwrFallback(): Promise<Record<string, unknown>> {
  const { pathname, searchParams } = await parseRequestUrl();
  const fallback: Record<string, unknown> = {};

  if (pathname === "/admin") {
    const [stats, activity] = await Promise.all([
      getAdminStats(),
      getAdminRecentActivity(),
    ]);
    fallback[adminDashboardKey()] = { stats, activity };
    return fallback;
  }

  if (pathname === "/admin/clients") {
    fallback[adminClientsKey()] = { clients: await getAdminClients() };
    return fallback;
  }

  if (pathname === "/admin/chat") {
    const coaches = await getCoaches();
    const coachId = coaches[0]?.id ?? "";
    const clients = await getAdminClientsForChat(coachId);
    const clientParam = searchParams.get("client");
    const selectedClientId =
      clientParam && clients.some((c) => c.id === clientParam)
        ? clientParam
        : (clients[0]?.id ?? "");
    const messages =
      selectedClientId && coachId
        ? await getMessages(selectedClientId, coachId)
        : [];
    fallback[adminChatRosterKey()] = { coaches, clients, coachId };
    if (selectedClientId) {
      fallback[adminChatMessagesKey(selectedClientId)] = {
        clientId: selectedClientId,
        messages,
      };
    }
    return fallback;
  }

  if (pathname === "/admin/programs") {
    const track = parseProgramTrack(searchParams.get("track"));
    const day = parseDay(searchParams.get("day"));
    const [program, videos] = await Promise.all([
      getProgramTemplate(track, day),
      getExerciseVideos(),
    ]);
    fallback[adminProgramsKey(track, day)] = { track, day, program, videos };
    return fallback;
  }

  if (pathname === "/admin/custom-programs") {
    const clients = await getAdminClients();
    const clientParam = searchParams.get("client") ?? "";
    const selectedEmail =
      clientParam && clients.some((c) => c.email === clientParam)
        ? clientParam
        : "";
    const week = parseWeek(searchParams.get("week"));
    const day = parseDay(searchParams.get("day"));
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
    fallback[adminCustomProgramsKey(clientParam, week, day)] = {
      clients,
      selectedEmail,
      week,
      day,
      initialExercises: exercises,
      initialCardio: cardio,
      initialRestDay: rest_day,
      initialLimits,
      videos,
    };
    return fallback;
  }

  if (pathname === "/admin/results") {
    const clients = await getAdminClients();
    const clientParam = searchParams.get("client") ?? "";
    const selectedClientId =
      clientParam && clients.some((c) => c.id === clientParam)
        ? clientParam
        : "";
    const week = parseWeek(searchParams.get("week"));
    const day = parseDay(searchParams.get("day"));
    const [logs, formChecks] = await Promise.all([
      selectedClientId
        ? getClientWorkoutLogs(selectedClientId, week, day)
        : Promise.resolve([]),
      selectedClientId
        ? getClientFormChecks(selectedClientId, week, day)
        : Promise.resolve([]),
    ]);
    fallback[adminResultsKey(clientParam, week, day)] = {
      clients,
      selectedClientId,
      week,
      day,
      logs,
      formChecks,
    };
    return fallback;
  }

  if (pathname === "/admin/weight-verification") {
    fallback[adminWeightVerificationKey()] = {
      lifts: await getPendingLifts(),
    };
    return fallback;
  }

  if (pathname === "/admin/videos") {
    fallback[adminVideosKey()] = { videos: await getExerciseVideos() };
    return fallback;
  }

  if (pathname === "/admin/nutrition") {
    const clients = await getAdminClients();
    const clientParam = searchParams.get("client")
      ? decodeURIComponent(searchParams.get("client")!)
      : "";
    const selectedClient = clientParam
      ? clients.find(
          (c) => c.id === clientParam || c.email === clientParam
        )
      : undefined;
    const selectedClientId = selectedClient?.id ?? "";
    const date = searchParams.get("date") ?? localDateKey(new Date());
    const meals = selectedClientId
      ? await getNutritionMealsForUser(selectedClientId, date)
      : [];
    fallback[adminNutritionKey(clientParam, date)] = {
      clients,
      selectedClientId,
      date,
      meals,
    };
    return fallback;
  }

  if (pathname === "/admin/form-checks") {
    fallback[adminFormChecksKey()] = {
      submissions: await getPendingFormChecks(),
    };
    return fallback;
  }

  return fallback;
}
