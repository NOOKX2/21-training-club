"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { ClientSectionHeading } from "@/components/ClientSectionHeading";
import { ExerciseVideoPlayer } from "@/components/ExerciseVideoPlayer";
import { StepperInput } from "@/components/StepperInput";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api-client";
import { useMuscleReward } from "@/components/MuscleStreakContext";
import type { CardioLog, WorkoutDay } from "@/lib/data";
import {
  clientCard,
  clientDayTab,
  clientDayTabActive,
  clientFieldLabel,
  clientPageEyebrow,
  clientPageTitle,
  clientSaveButtonClass,
  clientWeekSelect,
} from "@/lib/client-ui";
import { formatProgramCardio } from "@/lib/program-cardio";
import { cn } from "@/lib/utils";

const WEEK_OPTIONS = [1, 2, 3, 4];

export function WorkoutClient({
  userId,
  week,
  day,
  days,
  initialLogs,
  initialCardioLog,
}: {
  userId: string;
  week: number;
  day: number;
  days: WorkoutDay[];
  initialLogs: Record<string, { actual_weight: string; actual_reps: string }>;
  initialCardioLog: CardioLog;
}) {
  const router = useRouter();
  const { celebrateMuscleTask } = useMuscleReward();
  const [logs, setLogs] = useState(initialLogs);
  const [cardioLog, setCardioLog] = useState(initialCardioLog);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingCardio, setSavingCardio] = useState(false);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [cardioSaved, setCardioSaved] = useState(false);
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
      setSavedIds((s) => ({ ...s, [exerciseId]: true }));
      setTimeout(() => setSavedIds((s) => ({ ...s, [exerciseId]: false })), 2000);
      celebrateMuscleTask("workout");
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

  async function saveCardioLog() {
    setSavingCardio(true);
    try {
      await api("workouts/cardio-log", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          week,
          day,
          duration_minutes: cardioLog.duration_minutes,
          distance_km: cardioLog.distance_km,
          calories_burned: cardioLog.calories_burned,
        }),
      });
      setCardioSaved(true);
      setTimeout(() => setCardioSaved(false), 2000);
      celebrateMuscleTask("workout");
      router.refresh();
    } catch (err) {
      setMessages((m) => ({
        ...m,
        cardio: err instanceof Error ? err.message : "Save failed",
      }));
    } finally {
      setSavingCardio(false);
    }
  }

  return (
    <div>
      <p className={clientPageEyebrow}>Week Program</p>
      <h1 className={cn(clientPageTitle, "mb-8")}>Training Program</h1>

      <div className="mb-7 flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Week
        </span>
        <select
          value={week}
          onChange={(e) => navigate(Number(e.target.value), day)}
          className={clientWeekSelect}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B93B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          }}
        >
          {WEEK_OPTIONS.map((w) => (
            <option key={w} value={w} className="bg-zinc-900">
              Week {w}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-9 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => {
          const active = day === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => navigate(week, d)}
              className={cn(clientDayTab, active && clientDayTabActive)}
            >
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-[0.18em]",
                  active ? "text-black/50" : "text-white/45"
                )}
              >
                Day
              </span>
              <span
                className={cn(
                  "font-[family-name:var(--font-inter)] text-[26px] font-extrabold leading-none tracking-[-0.04em]",
                  active ? "text-black" : "text-white/60"
                )}
              >
                {d}
              </span>
            </button>
          );
        })}
      </div>

      <ClientSectionHeading className="mb-4">Day {day} Exercises</ClientSectionHeading>

      <div className="space-y-4">
        {dayData?.exercises.map((ex) => (
          <div key={ex.id} className={cn(clientCard, "w-full px-5 py-6 sm:px-6")}>
            <h3 className="font-[family-name:var(--font-inter)] text-lg font-extrabold tracking-[-0.03em] text-white">
              {ex.name}
            </h3>
            <p className="mt-1 mb-5 text-[13px] text-white/45">
              Target: {ex.target_sets} sets × {ex.target_reps} reps
            </p>

            <div
              className={cn(
                "mb-4 grid w-full gap-3 sm:gap-4",
                ex.demo_video || ex.image_url
                  ? "grid-cols-2 sm:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)]"
                  : "grid-cols-2"
              )}
            >
              {(ex.demo_video || ex.image_url) && (
                <div className="col-span-2 sm:col-span-1">
                  {ex.demo_video ? (
                    <ExerciseVideoPlayer video={ex.demo_video} title={ex.name} compact />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ex.image_url!}
                      alt={ex.name}
                      className="h-28 w-full max-w-[11rem] rounded-xl object-cover"
                    />
                  )}
                </div>
              )}

              <div className="flex min-w-0 flex-col gap-1.5">
                <label className={clientFieldLabel}>Weight (kg)</label>
                <StepperInput
                  className="w-full"
                  value={logs[ex.id]?.actual_weight ?? ""}
                  onChange={(actual_weight) =>
                    setLogs({
                      ...logs,
                      [ex.id]: {
                        actual_weight,
                        actual_reps: logs[ex.id]?.actual_reps ?? "",
                      },
                    })
                  }
                  step={1}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <label className={clientFieldLabel}>Reps</label>
                <StepperInput
                  className="w-full"
                  value={logs[ex.id]?.actual_reps ?? ""}
                  onChange={(actual_reps) =>
                    setLogs({
                      ...logs,
                      [ex.id]: {
                        actual_reps,
                        actual_weight: logs[ex.id]?.actual_weight ?? "",
                      },
                    })
                  }
                  step={1}
                  inputMode="numeric"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="save"
              className={cn(
                clientSaveButtonClass,
                savedIds[ex.id] && "border-white bg-white text-black hover:bg-white hover:text-black"
              )}
              onClick={() => saveLog(ex.id)}
              disabled={savingId === ex.id}
            >
              {savingId === ex.id ? "Saving…" : savedIds[ex.id] ? "Saved ✓" : "Save"}
            </Button>
            {messages[ex.id] && (
              <p className="mt-2 text-xs text-red-400">{messages[ex.id]}</p>
            )}
          </div>
        ))}
      </div>

      {dayData?.cardio && (
        <section className="mt-9">
          <ClientSectionHeading className="mb-4">Cardio</ClientSectionHeading>
          <div className={cn(clientCard, "px-6 py-6 sm:px-7")}>
            <div className="mb-5 flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#6B93B8] bg-gradient-to-br from-[#1C2E40] to-[#2a4560]">
                <Zap className="h-5 w-5 stroke-[#A8C5DC]" strokeWidth={2} />
              </div>
              <div>
                <p className="font-[family-name:var(--font-inter)] text-base font-extrabold tracking-[-0.02em] text-white">
                  Today&apos;s Cardio
                </p>
                <p className="text-xs text-white/45">
                  Target: {formatProgramCardio(dayData.cardio)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Duration (min)
                </label>
                <StepperInput
                  value={cardioLog.duration_minutes}
                  onChange={(duration_minutes) =>
                    setCardioLog({ ...cardioLog, duration_minutes })
                  }
                  inputMode="numeric"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Distance (km)
                </label>
                <StepperInput
                  value={cardioLog.distance_km}
                  onChange={(distance_km) => setCardioLog({ ...cardioLog, distance_km })}
                  step={1}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Burn (kcal)
                </label>
                <StepperInput
                  value={cardioLog.calories_burned}
                  onChange={(calories_burned) =>
                    setCardioLog({ ...cardioLog, calories_burned })
                  }
                  inputMode="numeric"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="save"
              className={cn(
                "mt-4",
                clientSaveButtonClass,
                cardioSaved && "border-white bg-white text-black hover:bg-white hover:text-black"
              )}
              onClick={saveCardioLog}
              disabled={savingCardio}
            >
              {savingCardio ? "Saving…" : cardioSaved ? "Saved ✓" : "Save"}
            </Button>
            {messages.cardio && (
              <p className="mt-2 text-xs text-red-400">{messages.cardio}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
