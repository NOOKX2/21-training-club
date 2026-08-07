import { tierBadgeClass } from "./admin-utils";

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tierBadgeClass(tier)}`}
    >
      {tier}
    </span>
  );
}
