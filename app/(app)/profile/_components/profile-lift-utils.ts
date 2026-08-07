import type { LiftRecord } from "@/lib/data";

export const LIFT_EXERCISES = ["Chest Press", "Squat", "Hip Thrusts", "Long Run"] as const;

export function recordFor(records: LiftRecord[], exercise: string) {
  return records.find((r) => r.exercise_name === exercise);
}

export function liftStatusLabel(status?: string) {
  if (status === "Verified") return "Verified";
  if (status === "Rejected") return "Rejected";
  if (status === "Pending") return "Pending review";
  return null;
}
