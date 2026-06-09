import type { ProgramCardio } from "./program-cardio";
import { formatProgramCardio } from "./program-cardio";
import type { ProgramSharePayload } from "./program-share-types";

export type ProgramShareExercise = {
  name: string;
  target_sets: number;
  target_reps: string;
  image_url?: string;
  demo_video?: ProgramSharePayload["exercises"][number]["demo_video"];
};

export function buildProgramSharePayload(opts: {
  week: number;
  day: number;
  exercises: ProgramShareExercise[];
  cardio?: ProgramCardio | null;
  question?: string;
}): ProgramSharePayload {
  return {
    week: opts.week,
    day: opts.day,
    exercises: opts.exercises.map((exercise) => ({
      name: exercise.name,
      target_sets: exercise.target_sets,
      target_reps: exercise.target_reps,
      image_url: exercise.image_url,
      demo_video: exercise.demo_video,
    })),
    cardio: opts.cardio ?? null,
    question: opts.question?.trim() || undefined,
  };
}

export function formatProgramShareMessage(opts: {
  week: number;
  day: number;
  exercises: ProgramShareExercise[];
  cardio?: ProgramCardio | null;
  question?: string;
}): string {
  const lines: string[] = [
    `📋 Program — Week ${opts.week}, Day ${opts.day}`,
    "",
  ];

  if (opts.exercises.length === 0) {
    lines.push("• No exercises listed for this day");
  } else {
    for (const exercise of opts.exercises) {
      lines.push(
        `• ${exercise.name} — ${exercise.target_sets} sets × ${exercise.target_reps} reps`
      );
    }
  }

  if (opts.cardio) {
    const cardioLine = formatProgramCardio(opts.cardio);
    if (cardioLine) {
      lines.push("", `Cardio: ${cardioLine}`);
    }
  }

  const question = opts.question?.trim();
  if (question) {
    lines.push("", `❓ ${question}`);
  }

  return lines.join("\n").trim();
}
