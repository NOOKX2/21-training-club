import useSWR from "swr";
import { api } from "@/lib/api-client";
import type {
  CardioLog,
  Coach,
  DailyNutritionScore,
  FormCheckSubmission,
  LiftRecord,
  MealSubmission,
  Message,
  NutritionLimits,
  ProgressPhoto,
  WeeklyReport,
  WeightEntry,
  WorkoutDay,
  WorkoutDayPageSlice,
  WorkoutLog,
} from "@/lib/data";

const fetcher = <T,>(path: string) => api<T>(path);

const swrOptions = {
  keepPreviousData: true,
  revalidateOnFocus: true,
  dedupingInterval: 3_000,
} as const;

export type WorkoutsPageData = {
  userId: string;
  week: number;
  day: number;
  days: WorkoutDay[];
  logs: Record<string, WorkoutLog>;
  cardioLog: CardioLog;
  formChecks: FormCheckSubmission[];
};

export type WorkoutWeekPageData = {
  userId: string;
  week: number;
  defaultDay: number;
  byDay: Record<number, WorkoutDayPageSlice>;
};

export type NutritionPageData = {
  userId: string;
  selectedDate: string;
  isToday: boolean;
  meals: MealSubmission[];
  scoreTrend: DailyNutritionScore[];
  limits: NutritionLimits;
};

export type ProgressPageData = {
  userId: string;
  history: WeightEntry[];
  photos: ProgressPhoto[];
  height: number | null;
};

export type CoachPageData = {
  userId: string;
  coachId: string;
  coaches: Coach[];
  messages: Message[];
  weeklyReports: WeeklyReport[];
  programStartDate: string;
};

export type ProfilePageData = {
  user: {
    id: string;
    name: string;
    email: string;
    tier_level: string;
    created_at?: string;
    access_expires_at?: string | null;
    profile_photo_url?: string | null;
    tdee: number | null;
  };
  records: LiftRecord[];
};

export function useWorkoutWeek(week: number) {
  return useSWR<WorkoutWeekPageData>(
    `app-pages/workouts?week=${week}`,
    fetcher,
    swrOptions
  );
}

/** @deprecated use useWorkoutWeek — kept for compatibility */
export function useWorkoutsPage(week: number, day: number) {
  return useSWR<WorkoutsPageData>(
    `app-pages/workouts?week=${week}&day=${day}`,
    fetcher,
    swrOptions
  );
}

export function useNutritionPage(date: string) {
  return useSWR<NutritionPageData>(
    `app-pages/nutrition?date=${date}`,
    fetcher,
    swrOptions
  );
}

export function useProgressPage() {
  return useSWR<ProgressPageData>("app-pages/progress", fetcher, swrOptions);
}

export function useCoachPage(coachId?: string) {
  const key = coachId
    ? `app-pages/coach?coach=${coachId}`
    : "app-pages/coach";
  return useSWR<CoachPageData>(key, fetcher, swrOptions);
}

export function useProfilePage() {
  return useSWR<ProfilePageData>("app-pages/profile", fetcher, swrOptions);
}
