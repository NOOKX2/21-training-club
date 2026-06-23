import useSWR, { type Cache } from "swr";
import { api } from "@/lib/api-client";
import type {
  AdminActivity,
  AdminChatClient,
  AdminClient,
  AdminStats,
  Coach,
  ExerciseVideo,
  FormCheckSubmission,
  MealSubmission,
  Message,
  NutritionLimits,
  PendingLift,
  ProgramExercise,
  ProgramTemplate,
  WorkoutLog,
} from "@/lib/data";
import type { ProgramCardio } from "@/lib/program-cardio";
import {
  adminChatMessagesKey,
  adminChatKey,
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
} from "@/lib/admin-page-keys";

const fetcher = <T,>(path: string) => api<T>(path);

const swrOptions = {
  keepPreviousData: true,
  revalidateOnFocus: true,
  dedupingInterval: 3_000,
} as const;

export type AdminDashboardPageData = {
  stats: AdminStats;
  activity: AdminActivity[];
};

export type AdminClientsPageData = {
  clients: AdminClient[];
};

export type AdminChatRosterData = {
  coaches: Coach[];
  clients: AdminChatClient[];
  coachId: string;
};

export type AdminChatMessagesData = {
  clientId: string;
  messages: Message[];
};

export type AdminChatPageData = {
  coaches: Coach[];
  clients: AdminChatClient[];
  selectedClientId: string;
  messages: Message[];
};

export type AdminProgramsPageData = {
  track: string;
  day: number;
  program: ProgramTemplate;
  videos: ExerciseVideo[];
};

export type AdminCustomProgramsPageData = {
  clients: AdminClient[];
  selectedEmail: string;
  week: number;
  day: number;
  initialExercises: ProgramExercise[];
  initialCardio: ProgramCardio | null;
  initialRestDay: boolean;
  initialLimits: NutritionLimits;
  videos: ExerciseVideo[];
};

export type AdminResultsPageData = {
  clients: AdminClient[];
  selectedClientId: string;
  week: number;
  day: number;
  logs: WorkoutLog[];
  formChecks: FormCheckSubmission[];
};

export type AdminWeightVerificationPageData = {
  lifts: PendingLift[];
};

export type AdminVideosPageData = {
  videos: ExerciseVideo[];
};

export type AdminNutritionPageData = {
  clients: AdminClient[];
  selectedClientId: string;
  date: string;
  meals: MealSubmission[];
};

export type AdminFormChecksPageData = {
  submissions: FormCheckSubmission[];
};

export function useAdminDashboardPage() {
  return useSWR<AdminDashboardPageData>(adminDashboardKey(), fetcher, swrOptions);
}

export function useAdminClientsPage() {
  return useSWR<AdminClientsPageData>(adminClientsKey(), fetcher, swrOptions);
}

export function useAdminChatRoster() {
  return useSWR<AdminChatRosterData>(
    adminChatRosterKey(),
    fetcher,
    swrOptions
  );
}

export function useAdminChatMessages(clientId: string) {
  return useSWR<AdminChatMessagesData>(
    clientId ? adminChatMessagesKey(clientId) : null,
    fetcher,
    swrOptions
  );
}

export function resolveAdminChatMessages(
  clientId: string,
  swrData: AdminChatMessagesData | undefined,
  cache: Cache
): Message[] | undefined {
  if (swrData?.clientId === clientId) return swrData.messages;
  const cached = cache.get(adminChatMessagesKey(clientId))?.data as
    | AdminChatMessagesData
    | undefined;
  if (cached?.clientId === clientId) return cached.messages;
  return undefined;
}

/** @deprecated use useAdminChatRoster + useAdminChatMessages */
export function useAdminChatPage(clientId?: string) {
  return useSWR<AdminChatPageData>(
    adminChatKey(clientId),
    fetcher,
    swrOptions
  );
}

export function useAdminProgramsPage(track: string, day: number) {
  return useSWR<AdminProgramsPageData>(
    adminProgramsKey(track, day),
    fetcher,
    swrOptions
  );
}

export function useAdminCustomProgramsPage(
  client: string,
  week: number,
  day: number
) {
  return useSWR<AdminCustomProgramsPageData>(
    adminCustomProgramsKey(client, week, day),
    fetcher,
    swrOptions
  );
}

export function useAdminResultsPage(
  clientId: string,
  week: number,
  day: number
) {
  return useSWR<AdminResultsPageData>(
    adminResultsKey(clientId, week, day),
    fetcher,
    swrOptions
  );
}

export function useAdminWeightVerificationPage() {
  return useSWR<AdminWeightVerificationPageData>(
    adminWeightVerificationKey(),
    fetcher,
    swrOptions
  );
}

export function useAdminVideosPage() {
  return useSWR<AdminVideosPageData>(adminVideosKey(), fetcher, swrOptions);
}

export function useAdminNutritionPage(clientId: string, date: string) {
  return useSWR<AdminNutritionPageData>(
    adminNutritionKey(clientId, date),
    fetcher,
    swrOptions
  );
}

export function useAdminFormChecksPage() {
  return useSWR<AdminFormChecksPageData>(
    adminFormChecksKey(),
    fetcher,
    swrOptions
  );
}
