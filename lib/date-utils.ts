export function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function localDayRange(dateKey: string): { start: string; end: string } {
  const [y, m, d] = dateKey.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function dateKeyFromIso(iso: string): string {
  return localDateKey(new Date(iso));
}

export function shiftDateKey(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const next = new Date(y, m - 1, d + delta);
  return localDateKey(next);
}

export function parsePastOrTodayDateKey(raw: string | null | undefined): string | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const today = localDateKey(new Date());
  if (raw > today) return null;
  return raw;
}

export function submittedAtForDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}

export function nutritionReturnPath(dateKey?: string | null): string {
  const today = localDateKey(new Date());
  if (!dateKey || dateKey === today) return "/nutrition";
  return `/nutrition?date=${encodeURIComponent(dateKey)}`;
}
