import type { ProgramCardio } from "./program-cardio";

export type ProgramShareExerciseItem = {
  name: string;
  target_sets: number;
  target_reps: string;
  image_url?: string;
  demo_video?: {
    id: string;
    video_url?: string;
    has_uploaded_file?: boolean;
    media_id?: string;
  };
};

export type ProgramSharePayload = {
  week: number;
  day: number;
  exercises: ProgramShareExerciseItem[];
  cardio?: ProgramCardio | null;
  question?: string;
};
