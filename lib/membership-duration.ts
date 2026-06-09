export type MembershipDurationValue =
  | ""
  | "21d"
  | "1m"
  | "2m"
  | "3m"
  | "4m"
  | "5m"
  | "6m"
  | "12m"
  | "none"
  | "custom";

export const MEMBERSHIP_DURATION_OPTIONS: {
  value: MembershipDurationValue;
  label: string;
}[] = [
  { value: "", label: "Select duration…" },
  { value: "21d", label: "21 days" },
  { value: "1m", label: "1 month" },
  { value: "2m", label: "2 months" },
  { value: "3m", label: "3 months" },
  { value: "4m", label: "4 months" },
  { value: "5m", label: "5 months" },
  { value: "6m", label: "6 months" },
  { value: "12m", label: "12 months" },
  { value: "none", label: "No expiry" },
  { value: "custom", label: "Custom date" },
];

function parseDateOnly(isoDate: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Expiry date from start + duration (21 days or N calendar months). */
export function computeAccessExpiry(
  startDate: string,
  duration: MembershipDurationValue
): string {
  if (!startDate || duration === "none" || duration === "custom" || !duration) {
    return "";
  }

  const start = parseDateOnly(startDate);
  if (!start) return "";

  const end = new Date(start.getTime());
  if (duration === "21d") {
    end.setUTCDate(end.getUTCDate() + 21);
  } else if (duration.endsWith("m")) {
    const months = Number.parseInt(duration, 10);
    if (!Number.isNaN(months)) {
      end.setUTCMonth(end.getUTCMonth() + months);
    }
  }

  return formatDateOnly(end);
}

export function inferMembershipDuration(
  startDate: string,
  expiryDate: string
): MembershipDurationValue {
  if (!expiryDate) return "none";
  if (!startDate) return "custom";

  for (const opt of MEMBERSHIP_DURATION_OPTIONS) {
    const value = opt.value;
    if (!value || value === "custom" || value === "none") continue;
    if (computeAccessExpiry(startDate, value) === expiryDate) return value;
  }
  return "custom";
}
