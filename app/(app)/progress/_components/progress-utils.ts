export function formatPhotoDate(date?: string) {
  if (!date) return "—";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function photoSelectLabel(photo: { date?: string; weight?: number | null }) {
  const date = formatPhotoDate(photo.date);
  const weight = photo.weight != null ? `${photo.weight} kg` : "Weight —";
  return `${date} · ${weight}`;
}

export function signedChangeColor(value: number | null | undefined) {
  if (value == null || value === 0) return "text-[#A8C5DC]";
  return value < 0 ? "text-red-400" : "text-emerald-400";
}

export function formatSigned(value: number, suffix: string) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}${suffix}`;
}
