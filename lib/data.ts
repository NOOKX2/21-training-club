import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";
import { getDb } from "./db";

const DEFAULT_COACH_IMAGE =
  "https://images.unsplash.com/photo-1550345332-09e3ac987658?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY29hY2glMjBwb3J0cmFpdHxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3ODA0OTQ2MjR8MA&ixlib=rb-4.1.0&q=85";

const DEFAULT_EXERCISE_IMAGE =
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxneW0lMjB3b3Jrb3V0JTIwYmFyYmVsbHxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3ODA0OTQ2MjR8MA&ixlib=rb-4.1.0&q=85";

export type MealSubmission = {
  id: string;
  meal_number: number;
  custom_name?: string;
  description?: string;
  photo_base64?: string;
  submitted_at: string;
  coach_reviewed: boolean;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  target_sets: number;
  target_reps: string;
  image_url: string;
};

export type WorkoutDay = { day: number; exercises: WorkoutExercise[] };

export type WorkoutLog = {
  exercise_id: string;
  actual_weight: string;
  actual_reps: string;
};

export type WeightEntry = { weight: number; height?: number; date: string };

export type ProgressPhoto = {
  id: string;
  photo_base64: string;
  weight?: number;
  notes?: string;
};

export type Coach = {
  id: string;
  name: string;
  profile_image_url: string;
  is_online: boolean;
};

export type Message = {
  id: string;
  sender: string;
  content: string;
  attachment_base64?: string;
  timestamp: string;
};

export type LiftRecord = {
  id: string;
  exercise_name: string;
  weight_lifted: number;
  verification_status: string;
};

export type AdminStats = {
  total_clients: number;
  mrr: number;
  churn_rate: number;
};

export type AdminClient = {
  id: string;
  email: string;
  name: string;
  tier_level: string;
  created_at?: string;
  assigned_meal_plan?: string;
};

export type AdminActivity = {
  name: string;
  email: string;
  created_at: string;
};

export type PendingLift = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  exercise_name: string;
  weight_lifted: number;
  submitted_at: string;
};

export type FormCheckSubmission = {
  id: string;
  user_id: string;
  user_name?: string;
  exercise_name?: string;
  video_base64?: string;
  status: string;
  submitted_at?: string;
};

export type ExerciseVideo = {
  id: string;
  name: string;
  video_url?: string;
};

export type ProgramExercise = {
  id: string;
  name: string;
  target_sets: number;
  target_reps: string;
  demo_video_id?: string | null;
};

export type ProgramTemplate = {
  id?: string;
  track: string;
  day: number;
  exercises: ProgramExercise[];
};

function defaultWeek(week: number) {
  return {
    id: uuidv4(),
    week,
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      exercises: Array.from({ length: 4 }, (_, j) => ({
        id: uuidv4(),
        name: `Exercise ${j + 1} Day ${i + 1}`,
        target_sets: 3,
        target_reps: "8-12",
        image_url: DEFAULT_EXERCISE_IMAGE,
        video_base64: "",
        demo_video_id: null,
      })),
    })),
  };
}

export async function getRegistrationEnabled(): Promise<boolean> {
  const db = await getDb();
  const count = await db.collection("users").countDocuments({});
  return count === 0;
}

export async function getMealsForUser(
  userId: string,
  date?: string
): Promise<MealSubmission[]> {
  const db = await getDb();
  const query: Record<string, unknown> = { user_id: userId };
  if (date) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    query.submitted_at = {
      $gte: start.toISOString(),
      $lt: end.toISOString(),
    };
  }
  const meals = await db
    .collection("meal_submissions_v2")
    .find(query)
    .project({ _id: 0 })
    .sort({ submitted_at: -1 })
    .toArray();
  return meals as MealSubmission[];
}

export async function getWorkoutPageData(
  userId: string,
  userEmail: string,
  week: number,
  day: number
): Promise<{ days: WorkoutDay[]; logs: Record<string, WorkoutLog> }> {
  const db = await getDb();

  const existing = await db
    .collection("workouts")
    .findOne({ week }, { projection: { _id: 0 } });
  const workout =
    existing ??
    (await (async () => {
      const created = defaultWeek(week);
      await db.collection("workouts").insertOne(created);
      return created;
    })());

  let days = (workout.days as WorkoutDay[]) ?? [];

  const program = await db.collection("custom_programs").findOne(
    { user_email: userEmail, week, day },
    { projection: { _id: 0 } }
  );
  if (program?.exercises?.length) {
    days = days.map((d) =>
      d.day === day
        ? { ...d, exercises: program.exercises as WorkoutExercise[] }
        : d
    );
  }

  const logDocs = await db
    .collection("workout_logs")
    .find({ user_id: userId, week, day })
    .project({ _id: 0 })
    .toArray();

  const logs: Record<string, WorkoutLog> = {};
  for (const l of logDocs) {
    logs[String(l.exercise_id)] = {
      exercise_id: String(l.exercise_id),
      actual_weight: String(l.actual_weight ?? ""),
      actual_reps: String(l.actual_reps ?? ""),
    };
  }

  return { days, logs };
}

export async function getWeightHistory(userId: string): Promise<WeightEntry[]> {
  const db = await getDb();
  const entries = await db
    .collection("weight_tracking")
    .find({ user_id: userId })
    .project({ _id: 0 })
    .sort({ date: 1 })
    .toArray();
  return entries as WeightEntry[];
}

export async function getUserHeight(userId: string): Promise<number | null> {
  const db = await getDb();
  const doc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  return doc?.height != null ? Number(doc.height) : null;
}

export async function getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
  const db = await getDb();
  const photos = await db
    .collection("progress_photos")
    .find({ user_id: userId })
    .project({ _id: 0 })
    .sort({ date: 1 })
    .toArray();
  return photos as ProgressPhoto[];
}

export async function getCoaches(): Promise<Coach[]> {
  const db = await getDb();
  let coaches = await db.collection("coaches").find({}).project({ _id: 0 }).toArray();
  if (coaches.length === 0) {
    const coach = {
      id: uuidv4(),
      name: "Coach Sarah",
      profile_image_url: DEFAULT_COACH_IMAGE,
      is_online: true,
    };
    await db.collection("coaches").insertOne(coach);
    coaches = [coach];
  }
  return coaches as Coach[];
}

export async function getMessages(userId: string, coachId: string): Promise<Message[]> {
  const db = await getDb();
  const messages = await db
    .collection("messages")
    .find({
      $or: [
        { user_id: userId, coach_id: coachId },
        { user_id: coachId, coach_id: userId },
      ],
    })
    .project({ _id: 0 })
    .sort({ timestamp: 1 })
    .toArray();
  return messages as Message[];
}

export async function getLiftRecords(userId: string): Promise<LiftRecord[]> {
  const db = await getDb();
  const lifts = await db
    .collection("lift_progress")
    .find({ user_id: userId })
    .project({ _id: 0 })
    .toArray();
  return lifts as LiftRecord[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = await getDb();
  const total_clients = await db.collection("users").countDocuments({ role: "user" });
  const tier_3_count = await db.collection("users").countDocuments({ tier_level: "Tier 3" });
  return {
    total_clients,
    mrr: tier_3_count * 299,
    churn_rate: 2.5,
  };
}

export async function getAdminRecentActivity(): Promise<AdminActivity[]> {
  const db = await getDb();
  const recent = await db
    .collection("users")
    .find({ role: "user" })
    .project({ _id: 0, name: 1, email: 1, created_at: 1 })
    .sort({ created_at: -1 })
    .limit(10)
    .toArray();
  return recent.map((r) => ({
    name: String(r.name),
    email: String(r.email),
    created_at: String(r.created_at ?? ""),
  }));
}

export async function getAdminClients(): Promise<AdminClient[]> {
  const db = await getDb();
  const clients = await db
    .collection("users")
    .find({ role: "user" })
    .sort({ created_at: -1 })
    .toArray();
  return clients.map((c) => ({
    id: String(c._id),
    email: String(c.email),
    name: String(c.name),
    tier_level: String(c.tier_level ?? "Tier 1"),
    created_at: c.created_at ? String(c.created_at) : undefined,
    assigned_meal_plan: c.assigned_meal_plan ? String(c.assigned_meal_plan) : undefined,
  }));
}

export async function getPendingLifts(): Promise<PendingLift[]> {
  const db = await getDb();
  const lifts = await db
    .collection("lift_progress")
    .find({ verification_status: "Pending" })
    .project({ _id: 0 })
    .sort({ submitted_at: -1 })
    .toArray();
  return lifts as PendingLift[];
}

export async function getPendingFormChecks(): Promise<FormCheckSubmission[]> {
  const db = await getDb();
  const subs = await db
    .collection("form_checks")
    .find({ status: "pending" })
    .project({ _id: 0 })
    .toArray();
  return subs as FormCheckSubmission[];
}

export async function getExerciseVideos(): Promise<ExerciseVideo[]> {
  const db = await getDb();
  const videos = await db.collection("exercise_videos").find({}).project({ _id: 0 }).toArray();
  return videos as ExerciseVideo[];
}

export async function getProgramTemplate(
  track: string,
  day: number
): Promise<ProgramTemplate> {
  const db = await getDb();
  const program = await db.collection("program_templates").findOne(
    { track, day },
    { projection: { _id: 0 } }
  );
  if (!program) {
    return { track, day, exercises: [], id: uuidv4() };
  }
  return {
    id: program.id ? String(program.id) : undefined,
    track: String(program.track ?? track),
    day: Number(program.day ?? day),
    exercises: (program.exercises as ProgramExercise[]) ?? [],
  };
}

export async function getCustomProgram(
  clientEmail: string,
  day: number
): Promise<{ exercises: ProgramExercise[] }> {
  const db = await getDb();
  const program = await db.collection("custom_programs").findOne(
    { client_email: clientEmail, day },
    { projection: { _id: 0 } }
  );
  return { exercises: (program?.exercises as ProgramExercise[]) ?? [] };
}

export async function getClientWorkoutLogs(
  userId: string,
  week: number,
  day: number
): Promise<WorkoutLog[]> {
  const db = await getDb();
  const logs = await db
    .collection("workout_logs")
    .find({ user_id: userId, week, day })
    .project({ _id: 0 })
    .toArray();
  return logs.map((l) => ({
    exercise_id: String(l.exercise_id),
    actual_weight: String(l.actual_weight ?? ""),
    actual_reps: String(l.actual_reps ?? ""),
  }));
}

export async function getNutritionMealsForUser(
  userId: string,
  date: string
): Promise<MealSubmission[]> {
  return getMealsForUser(userId, date);
}
