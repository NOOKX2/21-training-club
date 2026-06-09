import type { Locale } from "./types";

export function localeDateTag(locale: Locale): string {
  return locale === "th" ? "th-TH" : "en-US";
}

export function formatLocaleDate(
  iso: string | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string | null {
  if (!iso) return null;
  const normalized = iso.includes("T") ? iso : `${iso}T00:00:00.000Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(localeDateTag(locale), options);
}
