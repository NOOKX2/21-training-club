export type ProgramCardio = {
  duration_minutes?: number | null;
  distance_km?: number | null;
  treadmill_speed?: number | null;
  incline?: number | null;
  notes?: string;
};

export function normalizeProgramCardio(raw: unknown): ProgramCardio | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const duration =
    o.duration_minutes != null && o.duration_minutes !== ""
      ? Number(o.duration_minutes)
      : null;
  const distance =
    o.distance_km != null && o.distance_km !== ""
      ? Number(o.distance_km)
      : null;
  const treadmillSpeed =
    o.treadmill_speed != null && o.treadmill_speed !== ""
      ? Number(o.treadmill_speed)
      : null;
  const incline =
    o.incline != null && o.incline !== "" ? Number(o.incline) : null;
  const notes = typeof o.notes === "string" ? o.notes.trim() : "";
  const hasDuration =
    duration != null && Number.isFinite(duration) && duration > 0;
  const hasDistance =
    distance != null && Number.isFinite(distance) && distance > 0;
  const hasTreadmillSpeed =
    treadmillSpeed != null && Number.isFinite(treadmillSpeed) && treadmillSpeed > 0;
  const hasIncline =
    incline != null && Number.isFinite(incline) && incline >= 0;
  if (!hasDuration && !hasDistance && !hasTreadmillSpeed && !hasIncline && !notes) {
    return null;
  }
  return {
    duration_minutes: hasDuration ? duration : null,
    distance_km: hasDistance ? distance : null,
    treadmill_speed: hasTreadmillSpeed ? treadmillSpeed : null,
    incline: hasIncline ? incline : null,
    notes: notes || undefined,
  };
}

export function formatProgramCardio(cardio: ProgramCardio): string {
  const parts: string[] = [];
  if (cardio.duration_minutes) parts.push(`${cardio.duration_minutes} min`);
  if (cardio.distance_km) parts.push(`${cardio.distance_km} km`);
  if (cardio.treadmill_speed) parts.push(`${cardio.treadmill_speed} km/h`);
  if (cardio.incline != null) parts.push(`${cardio.incline}% incline`);
  if (cardio.notes) parts.push(cardio.notes);
  return parts.join(" · ");
}

export function cardioToFormState(cardio: ProgramCardio | null | undefined) {
  return {
    minutes:
      cardio?.duration_minutes != null ? String(cardio.duration_minutes) : "",
    km: cardio?.distance_km != null ? String(cardio.distance_km) : "",
    treadmillSpeed:
      cardio?.treadmill_speed != null ? String(cardio.treadmill_speed) : "",
    incline: cardio?.incline != null ? String(cardio.incline) : "",
    notes: cardio?.notes ?? "",
  };
}

export function formStateToCardio(state: {
  minutes: string;
  km: string;
  treadmillSpeed: string;
  incline: string;
  notes: string;
}): ProgramCardio | null {
  return normalizeProgramCardio({
    duration_minutes: state.minutes.trim() ? state.minutes : null,
    distance_km: state.km.trim() ? state.km : null,
    treadmill_speed: state.treadmillSpeed.trim() ? state.treadmillSpeed : null,
    incline: state.incline.trim() ? state.incline : null,
    notes: state.notes,
  });
}
