/** Client workout logs and program display use a single week slot (day 1–7 only in UI). */
export const CLIENT_WORKOUT_LOG_WEEK = 1;

export function workoutWeekKey(week: number = CLIENT_WORKOUT_LOG_WEEK) {
  return `app-pages/workouts?week=${week}`;
}

export function progressPageKey() {
  return "app-pages/progress";
}
