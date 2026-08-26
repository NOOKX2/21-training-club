import "server-only";

import type { Db } from "mongodb";
import { unstable_cache } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import type { ProgramCardio, ProgramExercise } from "./data";
import { normalizeProgramCardio } from "./program-cardio";
import {
  DEFAULT_WORKOUT_PROGRAM_ID,
  WORKOUT_PROGRAM_DAYS,
  resolveProgramDayRestDay,
  type ActiveWorkoutProgramInfo,
  type ExerciseVideoOption,
  type UserWorkoutDayDoc,
  type UserWorkoutProgram,
  type UserWorkoutTemplate,
  type WorkoutProgramDayEntry,
  type WorkoutProgramListFilter,
  type WorkoutProgramListItem,
  type WorkoutProgramStatus,
} from "./workout-program-shared";

export {
  DEFAULT_WORKOUT_PROGRAM_ID,
  WORKOUT_PROGRAM_DAYS,
  parseWorkoutProgramDay,
  parseWorkoutProgramId,
  resolveProgramDayRestDay,
  dayHasTrainingContent,
  type ActiveWorkoutProgramInfo,
  type ExerciseVideoOption,
  type UserWorkoutDayDoc,
  type UserWorkoutProgram,
  type UserWorkoutTemplate,
  type WorkoutProgramDayEntry,
  type WorkoutProgramListFilter,
  type WorkoutProgramListItem,
  type WorkoutProgramListStatus,
  type WorkoutProgramStatus,
} from "./workout-program-shared";

const PROGRAMS_COLLECTION = "user_workout_programs";

export function workoutProgramCacheTag(userId: string) {
  return `workout-program-${userId}`;
}

function emptyProgramDays(): WorkoutProgramDayEntry[] {
  return WORKOUT_PROGRAM_DAYS.map((day) => ({
    day,
    exercises: [],
    cardio: null,
    rest_day: true,
  }));
}

function normalizeProgramDays(days: WorkoutProgramDayEntry[] | undefined): WorkoutProgramDayEntry[] {
  const byDay = new Map<number, WorkoutProgramDayEntry>();
  for (const entry of days ?? []) {
    const day = Number(entry.day);
    if (!WORKOUT_PROGRAM_DAYS.includes(day as (typeof WORKOUT_PROGRAM_DAYS)[number])) continue;
    const exercises = (entry.exercises as ProgramExercise[]) ?? [];
    const cardio = normalizeProgramCardio(entry.cardio);
    byDay.set(day, {
      day,
      exercises,
      cardio,
      rest_day: resolveProgramDayRestDay({ exercises, cardio, rest_day: entry.rest_day }),
    });
  }
  return WORKOUT_PROGRAM_DAYS.map(
    (day) =>
      byDay.get(day) ?? {
        day,
        exercises: [],
        cardio: null,
        rest_day: true,
      }
  );
}

function programHasContent(program: UserWorkoutProgram): boolean {
  return program.days.some(
    (day) => day.rest_day || day.exercises.length > 0 || Boolean(day.cardio)
  );
}

function programStats(program: UserWorkoutProgram) {
  const exerciseCount = program.days.reduce((total, day) => total + day.exercises.length, 0);
  const trainingDays = program.days.filter(
    (day) => !day.rest_day && day.exercises.length > 0
  ).length;
  return { exerciseCount, trainingDays };
}

function toUserWorkoutProgram(doc: Record<string, unknown>): UserWorkoutProgram {
  return {
    id: String(doc.id),
    user_id: String(doc.user_id),
    name: String(doc.name ?? ""),
    status: doc.status === "active" ? "active" : "inactive",
    days: normalizeProgramDays(doc.days as WorkoutProgramDayEntry[]),
    created_at: String(doc.created_at ?? ""),
    updated_at: String(doc.updated_at ?? ""),
  };
}

export function programToDayDocs(program: UserWorkoutProgram): UserWorkoutDayDoc[] {
  return program.days.map((entry) => ({
    user_id: program.user_id,
    day: entry.day,
    exercises: entry.exercises,
    cardio: entry.cardio,
    rest_day: entry.rest_day,
    updated_at: program.updated_at,
  }));
}

export function programToTemplate(program: UserWorkoutProgram): UserWorkoutTemplate {
  return {
    id: program.id,
    user_id: program.user_id,
    name: program.name,
    days: program.days,
    created_at: program.created_at,
    updated_at: program.updated_at,
    is_enabled: program.status === "active",
  };
}

export function buildWorkoutProgramListItems(programs: UserWorkoutProgram[]): WorkoutProgramListItem[] {
  return dedupeProgramsById(programs).map((program) => {
    const { exerciseCount, trainingDays } = programStats(program);
    const hasContent = programHasContent(program);
    const isEnabled = program.status === "active";

    return {
      id: program.id,
      kind: program.id === DEFAULT_WORKOUT_PROGRAM_ID ? "main" : "template",
      name: program.name,
      status: !hasContent ? "draft" : isEnabled ? "enabled" : "disabled",
      isEnabled,
      hasContent,
      updatedAt: program.updated_at || program.created_at || null,
      exerciseCount,
      trainingDays,
      tags: [
        "7d",
        program.id === DEFAULT_WORKOUT_PROGRAM_ID
          ? exerciseCount > 0
            ? "strength"
            : "empty"
          : "template",
      ],
      editHref: `/workouts/program/edit?program=${program.id}&day=1&mode=edit`,
      viewHref: `/workouts/program/edit?program=${program.id}&day=1`,
    };
  });
}

export function filterWorkoutProgramListItems(
  items: WorkoutProgramListItem[],
  filter: WorkoutProgramListFilter
): WorkoutProgramListItem[] {
  if (filter === "active") {
    return items.filter((item) => item.status === "enabled");
  }
  if (filter === "drafts") {
    return items.filter((item) => item.status === "draft");
  }
  return items;
}

export function parseWorkoutProgramListFilter(
  value?: string | null
): WorkoutProgramListFilter {
  if (value === "active" || value === "drafts") return value;
  return "all";
}

async function readLegacyActiveProgramId(db: Db, userId: string): Promise<string | null> {
  const doc = await db.collection("user_workout_program_settings").findOne(
    { user_id: userId },
    { projection: { _id: 0 } }
  );
  if (doc && typeof doc.active_program_id === "string") {
    return doc.active_program_id;
  }
  if (doc?.main_enabled === false) return null;

  const count = await db.collection("user_workout_days").countDocuments({ user_id: userId });
  return count > 0 ? DEFAULT_WORKOUT_PROGRAM_ID : null;
}

async function migrateLegacyWorkoutPrograms(db: Db, userId: string): Promise<void> {
  const existing = await db.collection(PROGRAMS_COLLECTION).countDocuments({ user_id: userId });
  if (existing > 0) return;

  const now = new Date().toISOString();
  const activeProgramId = await readLegacyActiveProgramId(db, userId);
  const programs: UserWorkoutProgram[] = [];

  const dayDocs = await db
    .collection("user_workout_days")
    .find({ user_id: userId })
    .project({ _id: 0 })
    .toArray();

  const mainDays = normalizeProgramDays(
    dayDocs.map((doc) => ({
      day: Number(doc.day),
      exercises: (doc.exercises as ProgramExercise[]) ?? [],
      cardio: doc.cardio as ProgramCardio | null,
      rest_day: Boolean(doc.rest_day),
    }))
  );
  const mainUpdated = dayDocs.reduce<string>(
    (latest, doc) => {
      const updated = String(doc.updated_at ?? "");
      return updated > latest ? updated : latest;
    },
    now
  );

  programs.push({
    id: DEFAULT_WORKOUT_PROGRAM_ID,
    user_id: userId,
    name: "",
    status: activeProgramId === DEFAULT_WORKOUT_PROGRAM_ID ? "active" : "inactive",
    days: mainDays,
    created_at: mainUpdated,
    updated_at: mainUpdated,
  });

  const templateDocs = await db
    .collection("user_workout_templates")
    .find({ user_id: userId })
    .project({ _id: 0 })
    .toArray();

  for (const doc of templateDocs) {
    const id = String(doc.id);
    if (id === DEFAULT_WORKOUT_PROGRAM_ID) continue;
    if (programs.some((program) => program.id === id)) continue;
    programs.push({
      id,
      user_id: userId,
      name: String(doc.name ?? ""),
      status: activeProgramId === id ? "active" : "inactive",
      days: normalizeProgramDays(doc.days as WorkoutProgramDayEntry[]),
      created_at: String(doc.created_at ?? now),
      updated_at: String(doc.updated_at ?? doc.created_at ?? now),
    });
  }

  if (programs.length === 0) {
    programs.push({
      id: DEFAULT_WORKOUT_PROGRAM_ID,
      user_id: userId,
      name: "",
      status: "inactive",
      days: emptyProgramDays(),
      created_at: now,
      updated_at: now,
    });
  }

  const activeCount = programs.filter((program) => program.status === "active").length;
  if (activeCount > 1) {
    let kept = false;
    for (const program of programs) {
      if (program.status === "active") {
        if (kept) program.status = "inactive";
        else kept = true;
      }
    }
  }

  await db.collection(PROGRAMS_COLLECTION).insertMany(programs);
}

async function ensureDefaultWorkoutProgram(db: Db, userId: string): Promise<UserWorkoutProgram> {
  const existing = await db.collection(PROGRAMS_COLLECTION).findOne({
    user_id: userId,
    id: DEFAULT_WORKOUT_PROGRAM_ID,
  });
  if (existing) return toUserWorkoutProgram(existing);

  const now = new Date().toISOString();
  const program: UserWorkoutProgram = {
    id: DEFAULT_WORKOUT_PROGRAM_ID,
    user_id: userId,
    name: "",
    status: "inactive",
    days: emptyProgramDays(),
    created_at: now,
    updated_at: now,
  };
  await db.collection(PROGRAMS_COLLECTION).insertOne(program);
  return program;
}

function pickNewerProgram(a: UserWorkoutProgram, b: UserWorkoutProgram): UserWorkoutProgram {
  return a.updated_at >= b.updated_at ? a : b;
}

function dedupeProgramsById(programs: UserWorkoutProgram[]): UserWorkoutProgram[] {
  const byId = new Map<string, UserWorkoutProgram>();
  for (const program of programs) {
    const existing = byId.get(program.id);
    byId.set(program.id, existing ? pickNewerProgram(existing, program) : program);
  }
  return Array.from(byId.values());
}

async function normalizeSingleActiveProgram(db: Db, userId: string): Promise<void> {
  const activeDocs = await db
    .collection(PROGRAMS_COLLECTION)
    .find({ user_id: userId, status: "active" })
    .sort({ updated_at: -1 })
    .toArray();

  if (activeDocs.length <= 1) return;

  const now = new Date().toISOString();
  for (const doc of activeDocs.slice(1)) {
    await db.collection(PROGRAMS_COLLECTION).updateOne(
      { _id: doc._id },
      { $set: { status: "inactive", updated_at: now } }
    );
  }
}

export async function dedupeUserWorkoutProgramsInDb(db: Db, userId: string): Promise<void> {
  const docs = await db.collection(PROGRAMS_COLLECTION).find({ user_id: userId }).toArray();
  if (docs.length === 0) return;

  const byId = new Map<string, (typeof docs)[number][]>();
  for (const doc of docs) {
    const id = String(doc.id ?? "");
    if (!id) continue;
    const group = byId.get(id) ?? [];
    group.push(doc);
    byId.set(id, group);
  }

  for (const group of byId.values()) {
    if (group.length <= 1) continue;
    group.sort((a, b) =>
      String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? ""))
    );
    for (const duplicate of group.slice(1)) {
      await db.collection(PROGRAMS_COLLECTION).deleteOne({ _id: duplicate._id });
    }
  }

  await normalizeSingleActiveProgram(db, userId);
}

export async function dedupeAllWorkoutPrograms(db: Db): Promise<void> {
  const userIds = await db.collection(PROGRAMS_COLLECTION).distinct("user_id");
  for (const userId of userIds) {
    await dedupeUserWorkoutProgramsInDb(db, String(userId));
  }
}

export async function ensureUserWorkoutPrograms(db: Db, userId: string): Promise<void> {
  await dedupeUserWorkoutProgramsInDb(db, userId);
  await migrateLegacyWorkoutPrograms(db, userId);
  await ensureDefaultWorkoutProgram(db, userId);
  await dedupeUserWorkoutProgramsInDb(db, userId);
}

export async function listUserWorkoutPrograms(
  db: Db,
  userId: string
): Promise<UserWorkoutProgram[]> {
  await ensureUserWorkoutPrograms(db, userId);
  const docs = await db
    .collection(PROGRAMS_COLLECTION)
    .find({ user_id: userId })
    .project({ _id: 0 })
    .toArray();
  return dedupeProgramsById(
    docs.map((doc) => toUserWorkoutProgram(doc))
  ).sort((a, b) => {
      if (a.id === DEFAULT_WORKOUT_PROGRAM_ID) return -1;
      if (b.id === DEFAULT_WORKOUT_PROGRAM_ID) return 1;
      return b.updated_at.localeCompare(a.updated_at);
    });
}

export async function getUserWorkoutProgram(
  db: Db,
  userId: string,
  programId: string
): Promise<UserWorkoutProgram | null> {
  await ensureUserWorkoutPrograms(db, userId);
  const doc = await db.collection(PROGRAMS_COLLECTION).findOne({
    user_id: userId,
    id: programId,
  });
  return doc ? toUserWorkoutProgram(doc) : null;
}

export async function getActiveWorkoutProgram(
  db: Db,
  userId: string
): Promise<UserWorkoutProgram | null> {
  await ensureUserWorkoutPrograms(db, userId);
  const doc = await db.collection(PROGRAMS_COLLECTION).findOne({
    user_id: userId,
    status: "active",
  });
  return doc ? toUserWorkoutProgram(doc) : null;
}

export async function getActiveWorkoutProgramInfo(
  db: Db,
  userId: string
): Promise<ActiveWorkoutProgramInfo | null> {
  const program = await getActiveWorkoutProgram(db, userId);
  if (!program) return null;
  return { id: program.id, name: program.name };
}

export async function getActiveWorkoutDayForUser(
  db: Db,
  userId: string,
  day: number
): Promise<UserWorkoutDayDoc | null> {
  const program = await getActiveWorkoutProgram(db, userId);
  if (!program) return null;

  const entry = program.days.find((item) => item.day === day);
  if (!entry) {
    return {
      user_id: userId,
      day,
      exercises: [],
      cardio: null,
      rest_day: true,
      updated_at: program.updated_at,
    };
  }

  return {
    user_id: userId,
    day,
    exercises: entry.exercises,
    cardio: entry.cardio,
    rest_day: resolveProgramDayRestDay(entry),
    updated_at: program.updated_at,
  };
}

export async function isUserWorkoutProgramEnabled(db: Db, userId: string): Promise<boolean> {
  const program = await getActiveWorkoutProgram(db, userId);
  return program !== null;
}

export async function setWorkoutProgramEnabled(
  db: Db,
  userId: string,
  programId: string,
  enabled: boolean
): Promise<{ program_id: string; enabled: boolean }> {
  await ensureUserWorkoutPrograms(db, userId);
  const program = await getUserWorkoutProgram(db, userId, programId);
  if (!program) {
    throw new Error("Program not found");
  }

  const now = new Date().toISOString();

  if (enabled) {
    await db.collection(PROGRAMS_COLLECTION).updateMany(
      { user_id: userId, status: "active" },
      { $set: { status: "inactive", updated_at: now } }
    );
    await db.collection(PROGRAMS_COLLECTION).updateMany(
      { user_id: userId, id: programId },
      { $set: { status: "active", updated_at: now } }
    );
  } else {
    await db.collection(PROGRAMS_COLLECTION).updateMany(
      { user_id: userId, id: programId, status: "active" },
      { $set: { status: "inactive", updated_at: now } }
    );
  }

  return { program_id: programId, enabled };
}

export function cloneProgramExercises(exercises: ProgramExercise[]): ProgramExercise[] {
  return exercises.map((exercise) => ({
    ...exercise,
    id: uuidv4(),
  }));
}

export async function getUserWorkoutDayDoc(
  db: Db,
  userId: string,
  day: number,
  programId = DEFAULT_WORKOUT_PROGRAM_ID
): Promise<UserWorkoutDayDoc | null> {
  const program = await getUserWorkoutProgram(db, userId, programId);
  if (!program) return null;
  return programToDayDocs(program).find((entry) => entry.day === day) ?? null;
}

export async function userHasPersonalWorkoutProgram(
  db: Db,
  userId: string
): Promise<boolean> {
  const program = await getUserWorkoutProgram(db, userId, DEFAULT_WORKOUT_PROGRAM_ID);
  return program ? programHasContent(program) : false;
}

export async function getUserWorkoutProgramDays(
  db: Db,
  userId: string,
  programId = DEFAULT_WORKOUT_PROGRAM_ID
): Promise<UserWorkoutDayDoc[]> {
  const program = await getUserWorkoutProgram(db, userId, programId);
  if (!program) {
    return programToDayDocs({
      id: programId,
      user_id: userId,
      name: "",
      status: "inactive",
      days: emptyProgramDays(),
      created_at: "",
      updated_at: "",
    });
  }
  return programToDayDocs(program);
}

export async function saveUserWorkoutDay(
  db: Db,
  userId: string,
  day: number,
  payload: {
    exercises: ProgramExercise[];
    cardio: ProgramCardio | null;
    rest_day: boolean;
  },
  programId = DEFAULT_WORKOUT_PROGRAM_ID
): Promise<UserWorkoutDayDoc> {
  await ensureUserWorkoutPrograms(db, userId);
  await dedupeUserWorkoutProgramsInDb(db, userId);
  const program = await getUserWorkoutProgram(db, userId, programId);
  if (!program) {
    throw new Error("Program not found");
  }

  const updatedAt = new Date().toISOString();
  const nextDay: WorkoutProgramDayEntry = {
    day,
    exercises: payload.rest_day ? [] : payload.exercises,
    cardio: payload.rest_day ? null : payload.cardio,
    rest_day: payload.rest_day,
  };
  const days = program.days.map((entry) => (entry.day === day ? nextDay : entry));

  const result = await db.collection(PROGRAMS_COLLECTION).updateMany(
    { user_id: userId, id: programId },
    {
      $set: {
        days,
        updated_at: updatedAt,
      },
    }
  );
  if (result.matchedCount === 0) {
    throw new Error("Program not found");
  }

  await dedupeUserWorkoutProgramsInDb(db, userId);

  return {
    user_id: userId,
    day,
    exercises: nextDay.exercises,
    cardio: nextDay.cardio,
    rest_day: nextDay.rest_day,
    updated_at: updatedAt,
  };
}

export async function listUserWorkoutTemplates(
  db: Db,
  userId: string
): Promise<UserWorkoutTemplate[]> {
  const programs = await listUserWorkoutPrograms(db, userId);
  return programs
    .filter((program) => program.id !== DEFAULT_WORKOUT_PROGRAM_ID)
    .map(programToTemplate);
}

export async function saveUserWorkoutTemplate(
  db: Db,
  userId: string,
  name: string,
  sourceProgramId = DEFAULT_WORKOUT_PROGRAM_ID
): Promise<UserWorkoutTemplate> {
  const source = await getUserWorkoutProgram(db, userId, sourceProgramId);
  if (!source || !programHasContent(source)) {
    throw new Error("Add at least one training day before saving a template");
  }

  const now = new Date().toISOString();
  const program: UserWorkoutProgram = {
    id: uuidv4(),
    user_id: userId,
    name: name.trim(),
    status: "inactive",
    days: source.days.map((entry) => ({
      day: entry.day,
      exercises: cloneProgramExercises(entry.exercises),
      cardio: entry.rest_day ? null : normalizeProgramCardio(entry.cardio),
      rest_day: entry.rest_day,
    })),
    created_at: now,
    updated_at: now,
  };

  await db.collection(PROGRAMS_COLLECTION).insertOne(program);
  return programToTemplate(program);
}

export async function applyUserWorkoutTemplate(
  db: Db,
  userId: string,
  templateId: string,
  targetProgramId = DEFAULT_WORKOUT_PROGRAM_ID
): Promise<number> {
  const source = await getUserWorkoutProgram(db, userId, templateId);
  const target = await getUserWorkoutProgram(db, userId, targetProgramId);
  if (!source || !target) return 0;

  const now = new Date().toISOString();
  const days = source.days.map((entry) => ({
    day: entry.day,
    exercises: cloneProgramExercises(entry.exercises),
    cardio: entry.rest_day ? null : normalizeProgramCardio(entry.cardio),
    rest_day: entry.rest_day,
  }));

  await db.collection(PROGRAMS_COLLECTION).updateOne(
    { user_id: userId, id: targetProgramId },
    { $set: { days, updated_at: now } }
  );

  return days.length;
}

export async function deleteUserWorkoutTemplate(
  db: Db,
  userId: string,
  templateId: string
): Promise<boolean> {
  if (templateId === DEFAULT_WORKOUT_PROGRAM_ID) return false;
  const result = await db.collection(PROGRAMS_COLLECTION).deleteOne({
    user_id: userId,
    id: templateId,
  });
  return result.deletedCount > 0;
}

export async function deleteUserWorkoutProgram(
  db: Db,
  userId: string,
  programId: string
): Promise<{ deleted: boolean; reset: boolean }> {
  await ensureUserWorkoutPrograms(db, userId);

  if (programId === DEFAULT_WORKOUT_PROGRAM_ID) {
    const now = new Date().toISOString();
    const result = await db.collection(PROGRAMS_COLLECTION).updateMany(
      { user_id: userId, id: programId },
      {
        $set: {
          name: "",
          status: "inactive",
          days: emptyProgramDays(),
          updated_at: now,
        },
      }
    );
    return { deleted: false, reset: result.matchedCount > 0 };
  }

  const deleted = await deleteUserWorkoutTemplate(db, userId, programId);
  return { deleted, reset: false };
}

export async function updateUserWorkoutProgramName(
  db: Db,
  userId: string,
  programId: string,
  name: string
): Promise<UserWorkoutProgram> {
  await ensureUserWorkoutPrograms(db, userId);
  const now = new Date().toISOString();
  const result = await db.collection(PROGRAMS_COLLECTION).updateMany(
    { user_id: userId, id: programId },
    { $set: { name: name.trim(), updated_at: now } }
  );
  if (result.matchedCount === 0) {
    throw new Error("Program not found");
  }
  await dedupeUserWorkoutProgramsInDb(db, userId);
  const program = await getUserWorkoutProgram(db, userId, programId);
  if (!program) {
    throw new Error("Program not found");
  }
  return program;
}

export async function getWorkoutProgramEditorPageData(
  userId: string,
  programId = DEFAULT_WORKOUT_PROGRAM_ID
): Promise<{
  programId: string;
  programName: string;
  days: UserWorkoutDayDoc[];
  videos: ExerciseVideoOption[];
}> {
  const { getDb } = await import("./db");
  const { listExerciseOptionsForUser } = await import("./user-exercises");
  const db = await getDb();
  await ensureUserWorkoutPrograms(db, userId);
  const program = await getUserWorkoutProgram(db, userId, programId);
  const videos = await listExerciseOptionsForUser(db, userId);
  const resolvedProgram = program ?? (await ensureDefaultWorkoutProgram(db, userId));
  return {
    programId: resolvedProgram.id,
    programName: resolvedProgram.name,
    days: programToDayDocs(resolvedProgram),
    videos,
  };
}

export async function getWorkoutProgramPageData(
  userId: string,
  programId = DEFAULT_WORKOUT_PROGRAM_ID
): Promise<{
  programId: string;
  programName: string;
  days: UserWorkoutDayDoc[];
  templates: UserWorkoutTemplate[];
  videos: ExerciseVideoOption[];
}> {
  return unstable_cache(
    async () => {
      const { getDb } = await import("./db");
      const { listExerciseOptionsForUser } = await import("./user-exercises");
      const db = await getDb();
      const program = await getUserWorkoutProgram(db, userId, programId);
      const [programs, videos] = await Promise.all([
        listUserWorkoutPrograms(db, userId),
        listExerciseOptionsForUser(db, userId),
      ]);
      const resolvedProgram =
        program ??
        (await ensureDefaultWorkoutProgram(db, userId));
      return {
        programId: resolvedProgram.id,
        programName: resolvedProgram.name,
        days: programToDayDocs(resolvedProgram),
        templates: programs
          .filter((entry) => entry.id !== resolvedProgram.id)
          .map(programToTemplate),
        videos,
      };
    },
    ["workout-program-page", userId, programId],
    { revalidate: 60, tags: [workoutProgramCacheTag(userId)] }
  )();
}

export async function getWorkoutProgramListPageData(userId: string): Promise<{
  items: WorkoutProgramListItem[];
}> {
  return unstable_cache(
    async () => {
      const { getDb } = await import("./db");
      const db = await getDb();
      const programs = await listUserWorkoutPrograms(db, userId);
      return { items: buildWorkoutProgramListItems(programs) };
    },
    ["workout-program-list", userId],
    { revalidate: 60, tags: [workoutProgramCacheTag(userId)] }
  )();
}
