import { CalendarClock, TrendingUp, Users } from "lucide-react";
import type { AdminActivity, AdminStats } from "@/lib/data";
import { formatJoinedDate } from "./admin-utils";

const TIER_CARDS = [
  {
    key: "tier_1" as const,
    label: "Tier 1",
    subtitle: "The Engine",
    accent: "text-[#6B93B8]",
    ring: "bg-[#6B93B8]/20",
  },
  {
    key: "tier_2" as const,
    label: "Tier 2",
    subtitle: "The Builder",
    accent: "text-emerald-400",
    ring: "bg-emerald-500/20",
  },
  {
    key: "tier_3" as const,
    label: "Tier 3",
    subtitle: "VIP",
    accent: "text-amber-400",
    ring: "bg-amber-400/20",
  },
];

export function AdminDashboard({
  stats,
  activity,
}: {
  stats: AdminStats;
  activity: AdminActivity[];
}) {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">
        Dashboard Overview
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border border-zinc-800 bg-zinc-950/80 p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6B93B8]/20">
              <TrendingUp className="h-5 w-5 text-[#6B93B8]" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Active
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{stats.total_clients}</p>
          <p className="mt-1 text-xs text-zinc-500">Total Active Clients</p>
        </div>

        {TIER_CARDS.map((tier) => (
          <div key={tier.key} className="border border-zinc-800 bg-zinc-950/80 p-5">
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${tier.ring}`}
              >
                <Users className={`h-5 w-5 ${tier.accent}`} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {tier.label}
              </span>
            </div>
            <p className={`mt-4 text-3xl font-bold ${tier.accent}`}>
              {stats.tier_counts[tier.key]}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{tier.subtitle}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-[#6B93B8]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            Expiring by Month
          </h2>
        </div>
        <p className="mb-4 text-xs text-zinc-500">
          Clients whose access expires by the end of each month
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.expiring_by_month.map((month) => (
            <div
              key={month.month_key}
              className="border border-zinc-800 bg-zinc-950/80 px-4 py-4 text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {month.label}
              </p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  month.count > 0 ? "text-amber-400" : "text-white"
                }`}
              >
                {month.count}
              </p>
              <p className="mt-1 text-[10px] text-zinc-600">
                {month.count === 1 ? "client" : "clients"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
          Recent Client Activity
        </h2>
        <div className="divide-y divide-zinc-800 border border-zinc-800">
          {activity.length === 0 ? (
            <p className="p-6 text-center text-sm text-zinc-500">No clients yet</p>
          ) : (
            activity.map((a) => (
              <div
                key={a.email}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div>
                  <p className="font-semibold text-white">{a.name}</p>
                  <p className="text-sm text-zinc-500">{a.email}</p>
                </div>
                <p className="text-xs text-zinc-500">
                  Joined {formatJoinedDate(a.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
