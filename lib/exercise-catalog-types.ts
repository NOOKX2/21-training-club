export const EXERCISE_CATALOG_TYPES = [
  "chest",
  "back",
  "arms",
  "legs",
  "shoulders",
] as const;

export type ExerciseCatalogType = (typeof EXERCISE_CATALOG_TYPES)[number];

export const EXERCISE_CATALOG_TYPE_LABELS: Record<ExerciseCatalogType, string> = {
  chest: "Chest",
  back: "Back",
  arms: "Arms",
  legs: "Legs",
  shoulders: "Shoulders",
};

export const EXERCISE_CATALOG_TYPE_LABELS_TH: Record<ExerciseCatalogType, string> = {
  chest: "อก",
  back: "หลัง",
  arms: "แขน",
  legs: "ขา",
  shoulders: "ไหล่",
};

export function isExerciseCatalogType(value: string): value is ExerciseCatalogType {
  return (EXERCISE_CATALOG_TYPES as readonly string[]).includes(value);
}

export function formatExerciseCatalogType(
  type: string,
  locale: "en" | "th" = "en"
): string {
  if (!isExerciseCatalogType(type)) return type;
  return locale === "th"
    ? EXERCISE_CATALOG_TYPE_LABELS_TH[type]
    : EXERCISE_CATALOG_TYPE_LABELS[type];
}

export function resolveExerciseCatalogType(doc: {
  type?: string;
  tags?: string[];
}): ExerciseCatalogType | "" {
  if (doc.type && isExerciseCatalogType(doc.type)) return doc.type;
  for (const tag of doc.tags ?? []) {
    const normalized = tag.trim().toLowerCase();
    if (isExerciseCatalogType(normalized)) return normalized;
  }
  return "";
}
