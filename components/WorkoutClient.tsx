"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseVideoPlayer } from "@/components/ExerciseVideoPlayer";
import { Input, FieldLabel } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FitSelect } from "@/components/FitSelect";
import { api } from "@/lib/api-client";
import type { WorkoutDay } from "@/lib/data";
import { cn } from "@/lib/utils";

export function WorkoutClient({
  userId,
  week,
  day,
  days,
  initialLogs,
}: {
  userId: string;
  week: number;
  day: number;
  days: WorkoutDay[];
  initialLogs: Record<string, { actual_weight: string; actual_reps: string }>;
}) {
  const router = useRouter();
  const [logs, setLogs] = useState(initialLogs);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const dayData = days.find((d) => d.day === day);

  function navigate(nextWeek: number, nextDay: number) {
    router.push(`/workouts?week=${nextWeek}&day=${nextDay}`);
  }

  async function saveLog(exerciseId: string) {
    const entry = logs[exerciseId];
    setSavingId(exerciseId);
    setMessages((m) => ({ ...m, [exerciseId]: "" }));
    try {
      await api("workouts/log", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          exercise_id: exerciseId,
          week,
          day,
          actual_weight: entry?.actual_weight ?? "0",
          actual_reps: entry?.actual_reps ?? "0",
        }),
      });
      setMessages((m) => ({ ...m, [exerciseId]: "Saved" }));
      router.refresh();
    } catch (err) {
      setMessages((m) => ({
        ...m,
        [exerciseId]: err instanceof Error ? err.message : "Save failed",
      }));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-white">
          Training Program
        </h1>
        <div className="mt-6">
          <FitSelect
            label="Week"
            value={week}
            onChange={(w) => navigate(w, day)}
            options={[1, 2, 3, 4].map((w) => ({
              value: w,
              label: `Week ${w}`,
            }))}
          />
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => navigate(week, d)}
              className={cn(
                "flex flex-col items-center justify-center border py-5 transition-colors",
                day === d
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 bg-black text-white hover:border-zinc-500"
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-widest">
                Day
              </span>
              <span className="mt-1 text-4xl font-light">{d}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold uppercase tracking-tight text-white">
          Day {day} Exercises
        </h2>

        <div className="divide-y divide-zinc-800 border border-zinc-800">
          {dayData?.exercises.map((ex) => (
            <div key={ex.id} className="p-6">
              <div className="flex gap-5">
                <div className="shrink-0">
                  {ex.demo_video ? (
                    <ExerciseVideoPlayer
                      video={ex.demo_video}
                      title={ex.name}
                      compact
                    />
                  ) : ex.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ex.image_url}
                      alt={ex.name}
                      className="h-28 w-36 object-cover grayscale"
                    />
                  ) : (
                    <div className="h-28 w-36 bg-zinc-900" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold uppercase tracking-wide text-white">
                    {ex.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Target: {ex.target_sets} sets × {ex.target_reps} reps
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Weight (kg)</FieldLabel>
                      <Input
                        type="number"
                        placeholder="0"
                        value={logs[ex.id]?.actual_weight ?? ""}
                        onChange={(e) =>
                          setLogs({
                            ...logs,
                            [ex.id]: {
                              actual_weight: e.target.value,
                              actual_reps: logs[ex.id]?.actual_reps ?? "",
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel>Reps</FieldLabel>
                      <Input
                        type="number"
                        placeholder="0"
                        value={logs[ex.id]?.actual_reps ?? ""}
                        onChange={(e) =>
                          setLogs({
                            ...logs,
                            [ex.id]: {
                              actual_reps: e.target.value,
                              actual_weight: logs[ex.id]?.actual_weight ?? "",
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="mt-5 h-12 w-full text-sm"
                    onClick={() => saveLog(ex.id)}
                    disabled={savingId === ex.id}
                  >
                    {savingId === ex.id ? "Saving…" : "Save"}
                  </Button>
                  {messages[ex.id] && (
                    <p
                      className={`mt-2 text-xs ${
                        messages[ex.id] === "Saved"
                          ? "text-[#a3e635]"
                          : "text-red-400"
                      }`}
                    >
                      {messages[ex.id]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
