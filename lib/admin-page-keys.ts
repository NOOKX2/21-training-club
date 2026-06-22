const TRACKS = ["Fat Loss", "Muscle Gain", "Maintenance"];

export function adminDashboardKey() {
  return "admin-pages/dashboard";
}

export function adminClientsKey() {
  return "admin-pages/clients";
}

export function adminChatKey(clientId?: string) {
  return clientId
    ? `admin-pages/chat?client=${clientId}`
    : "admin-pages/chat";
}

export function adminProgramsKey(track: string, day: number) {
  return `admin-pages/programs?track=${encodeURIComponent(track)}&day=${day}`;
}

export function adminCustomProgramsKey(
  client: string,
  week: number,
  day: number
) {
  const params = new URLSearchParams();
  if (client) params.set("client", client);
  params.set("week", String(week));
  params.set("day", String(day));
  return `admin-pages/custom-programs?${params.toString()}`;
}

export function adminResultsKey(clientId: string, week: number, day: number) {
  const params = new URLSearchParams();
  if (clientId) params.set("client", clientId);
  params.set("week", String(week));
  params.set("day", String(day));
  return `admin-pages/results?${params.toString()}`;
}

export function adminWeightVerificationKey() {
  return "admin-pages/weight-verification";
}

export function adminVideosKey() {
  return "admin-pages/videos";
}

export function adminNutritionKey(clientId: string, date: string) {
  const params = new URLSearchParams();
  if (clientId) params.set("client", clientId);
  params.set("date", date);
  return `admin-pages/nutrition?${params.toString()}`;
}

export function adminFormChecksKey() {
  return "admin-pages/form-checks";
}

export function parseProgramTrack(raw: string | null) {
  return raw && TRACKS.includes(raw) ? raw : "Fat Loss";
}

export function parseWeek(raw: string | null) {
  return Math.min(4, Math.max(1, parseInt(raw ?? "1", 10) || 1));
}

export function parseDay(raw: string | null) {
  return Math.min(7, Math.max(1, parseInt(raw ?? "1", 10) || 1));
}

export { TRACKS };
