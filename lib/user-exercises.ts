import type { Db } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import type { ExerciseVideoOption } from "./user-workout-program";
import type { ExercisePickerItem } from "./workout-exercise-picker";
import { resolveExerciseMediaItems } from "./exercise-media-utils";

export type UserExercise = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export async function listUserExercises(
  db: Db,
  userId: string
): Promise<UserExercise[]> {
  const docs = await db
    .collection("user_exercises")
    .find({ user_id: userId })
    .project({ _id: 0 })
    .sort({ name: 1 })
    .toArray();
  return docs as UserExercise[];
}

export async function createUserExercise(
  db: Db,
  userId: string,
  name: string
): Promise<UserExercise> {
  const exercise: UserExercise = {
    id: uuidv4(),
    user_id: userId,
    name: name.trim(),
    created_at: new Date().toISOString(),
  };
  await db.collection("user_exercises").insertOne(exercise);
  return exercise;
}

export async function listExerciseOptionsForUser(
  db: Db,
  userId: string
): Promise<ExerciseVideoOption[]> {
  const items = await listExercisePickerItemsForUser(db, userId);
  return items.map(({ id, name }) => ({ id, name }));
}

function exerciseHasMedia(doc: {
  video_url?: unknown;
  video_file_id?: unknown;
  video_base64?: unknown;
  media_items?: unknown;
}): boolean {
  if (doc.video_url || doc.video_file_id || doc.video_base64) return true;
  return Array.isArray(doc.media_items) && doc.media_items.length > 0;
}

export async function listExercisePickerItemsForUser(
  db: Db,
  userId: string
): Promise<ExercisePickerItem[]> {
  const [globalVideos, userExercises] = await Promise.all([
    db
      .collection("exercise_videos")
      .find({})
      .project({
        _id: 0,
        id: 1,
        name: 1,
        video_url: 1,
        video_file_id: 1,
        video_base64: 1,
        media_items: 1,
        type: 1,
        muscle_target: 1,
        equipment: 1,
        difficulty: 1,
        description: 1,
      })
      .sort({ name: 1 })
      .toArray(),
    listUserExercises(db, userId),
  ]);

  const options = new Map<string, ExercisePickerItem>();
  for (const video of globalVideos) {
    const id = String(video.id);
    const mediaItems = resolveExerciseMediaItems({
      id,
      media_items: video.media_items as Parameters<
        typeof resolveExerciseMediaItems
      >[0]["media_items"],
      video_url: video.video_url as string | undefined,
      video_file_id: video.video_file_id as string | undefined,
      video_base64: video.video_base64 as string | undefined,
    });
    const primary = mediaItems[0];
    options.set(id, {
      id,
      name: String(video.name ?? ""),
      hasMedia: exerciseHasMedia(video),
      source: "library",
      type: video.type ? String(video.type) : undefined,
      muscle_target: video.muscle_target ? String(video.muscle_target) : undefined,
      equipment: video.equipment ? String(video.equipment) : undefined,
      difficulty: video.difficulty ? String(video.difficulty) : undefined,
      description: video.description ? String(video.description) : undefined,
      preview: primary
        ? {
            type: primary.type,
            video_url: primary.video_url,
            has_uploaded_file: primary.has_uploaded_file,
            media_id: primary.id,
          }
        : undefined,
    });
  }
  for (const exercise of userExercises) {
    options.set(exercise.id, {
      id: exercise.id,
      name: exercise.name,
      hasMedia: false,
      source: "custom",
    });
  }

  return [...options.values()].sort((a, b) => a.name.localeCompare(b.name));
}
