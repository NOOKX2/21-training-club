export function formatJoinedDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

export function tierBadgeClass(tier: string): string {
  if (tier === "Tier 3") return "bg-amber-400/20 text-amber-300 border-amber-400/40";
  if (tier === "Tier 2") return "bg-sky-400/20 text-sky-300 border-sky-400/40";
  return "bg-zinc-700/50 text-zinc-300 border-zinc-600";
}
