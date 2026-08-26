export const CLIENT_WORKOUT_LOG_WEEK = 1;
export const MAX_WORKOUT_LOG_WEEK = 12;

export function workoutWeekKey(week: number = CLIENT_WORKOUT_LOG_WEEK) {
  return `app-pages/workouts?week=${week}`;
}

export function parseWorkoutLogWeek(raw?: string | null): number {
  return Math.min(
    MAX_WORKOUT_LOG_WEEK,
    Math.max(1, parseInt(raw ?? String(CLIENT_WORKOUT_LOG_WEEK), 10) || CLIENT_WORKOUT_LOG_WEEK)
  );
}

export function workoutMaxWeekStorageKey(userId: string) {
  return `workout-log-max-week:${userId}`;
}

export function readStoredMaxWeek(userId: string): number {
  if (typeof window === "undefined") return CLIENT_WORKOUT_LOG_WEEK;
  const raw = localStorage.getItem(workoutMaxWeekStorageKey(userId));
  return parseWorkoutLogWeek(raw);
}

export function writeStoredMaxWeek(userId: string, week: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    workoutMaxWeekStorageKey(userId),
    String(parseWorkoutLogWeek(String(week)))
  );
}

export function progressPageKey() {
  return "app-pages/progress";
}
