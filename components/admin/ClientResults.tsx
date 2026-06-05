"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { FieldLabel } from "@/components/ui/Input";
import type { AdminClient, WorkoutLog } from "@/lib/data";

export function ClientResults({
  clients,
  selectedClientId,
  week,
  day,
  logs,
}: {
  clients: AdminClient[];
  selectedClientId: string;
  week: number;
  day: number;
  logs: WorkoutLog[];
}) {
  const router = useRouter();
  const selected = clients.find((c) => c.id === selectedClientId);

  function navigate(clientId: string, w: number, d: number) {
    const params = new URLSearchParams();
    if (clientId) params.set("client", clientId);
    params.set("week", String(w));
    params.set("day", String(d));
    router.push(`/admin/results?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
          Client Results
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track client progress and workout completion
        </p>
      </div>

      <div className="border border-zinc-800 p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          <User className="h-4 w-4" />
          Select Client
        </div>
        <select
          value={selectedClientId}
          onChange={(e) => navigate(e.target.value, week, day)}
          className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
        >
          <option value="">Choose a client...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email}) - {c.tier_level}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="border border-zinc-800 p-6">
          <div className="mb-6 grid max-w-md grid-cols-2 gap-4">
            <div>
              <FieldLabel>Week</FieldLabel>
              <select
                value={week}
                onChange={(e) =>
                  navigate(selectedClientId, Number(e.target.value), day)
                }
                className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
              >
                {[1, 2, 3, 4].map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Day</FieldLabel>
              <select
                value={day}
                onChange={(e) =>
                  navigate(selectedClientId, week, Number(e.target.value))
                }
                className="w-full border border-zinc-700 bg-black px-4 py-3 text-sm text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="mb-4 text-sm font-bold uppercase text-white">
            Workout Logs — {selected.name}
          </h2>

          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No workout logs for Week {week}, Day {day}
            </p>
          ) : (
            <div className="divide-y divide-zinc-800 border border-zinc-800">
              {logs.map((log, index) => (
                <div
                  key={log.id ?? `${log.exercise_id}-${index}`}
                  className="flex items-center justify-between px-5 py-3 text-sm"
                >
                  <span className="font-medium uppercase text-white">
                    {log.exercise_name ?? "Unknown exercise"}
                  </span>
                  <span className="text-white">
                    {log.actual_weight} kg × {log.actual_reps} reps
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
