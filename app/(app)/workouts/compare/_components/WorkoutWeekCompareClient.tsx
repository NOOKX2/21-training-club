"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, TrendingDown, TrendingUp } from "lucide-react";
import { ClientPageHeader } from "@/components/ClientPageHeader";
import { useLanguage } from "@/components/LanguageProvider";
import { WorkoutDayTabs } from "@/app/(app)/workouts/_components/WorkoutDayTabs";
import { clientCard } from "@/lib/client-ui";
import type { WorkoutWeekCompareData } from "@/lib/data";
import { cn } from "@/lib/utils";

function formatKg(value: number | null) {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function WorkoutWeekCompareClient({
  data,
}: {
  data: WorkoutWeekCompareData;
}) {
  const { t } = useLanguage();
  const router = useRouter();

  function selectDay(day: number) {
    router.push(`/workouts/compare?day=${day}`);
  }

  const emptyMessage = !data.programName
    ? t("workouts.weekCompareNoProgram")
    : data.restDay
      ? t("workouts.weekCompareRestDay")
      : t("workouts.weekCompareEmpty");

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/workouts"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("workouts.backToWorkouts")}
      </Link>

      <ClientPageHeader
        eyebrow={t("workouts.weekCompareEyebrow")}
        title={t("workouts.weekCompareTitle")}
        subtitle={t("workouts.weekCompareSubtitle")}
        className="mb-6"
      />

      {data.programName ? (
        <p className="mb-4 text-sm text-[#A8C5DC]">
          {t("workouts.weekCompareProgramLabel", { name: data.programName })}
        </p>
      ) : null}

      <WorkoutDayTabs day={data.day} onSelect={selectDay} />

      {!data.rows.length ? (
        <div className={cn(clientCard, "px-6 py-12 text-center")}>
          <p className="text-sm text-white/45">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.rows.map((row) => {
            const improved = (row.changeKg ?? 0) > 0;
            const declined = (row.changeKg ?? 0) < 0;
            return (
              <article key={row.exerciseId} className={cn(clientCard, "overflow-hidden")}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                      {t("workouts.weekCompareExercise")}
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-inter)] text-base font-extrabold tracking-[-0.02em] text-white sm:text-lg">
                      {row.exerciseName === "Unknown exercise"
                        ? t("workouts.weekCompareUnknownExercise")
                        : row.exerciseName}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                      {t("workouts.weekCompareChange")}
                    </p>
                    <p
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 text-sm font-bold",
                        improved
                          ? "text-emerald-300"
                          : declined
                            ? "text-red-300"
                            : "text-white/50"
                      )}
                    >
                      {improved ? <TrendingUp className="h-4 w-4" /> : null}
                      {declined ? <TrendingDown className="h-4 w-4" /> : null}
                      {row.changeKg == null
                        ? t("workouts.weekCompareNoChange")
                        : `${row.changeKg > 0 ? "+" : ""}${formatKg(row.changeKg)} ${t("common.kg")}`}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="flex min-w-max gap-2 px-4 py-4 sm:px-5">
                    {row.weeks.map((entry) => (
                      <div
                        key={entry.week}
                        className="min-w-[4.5rem] rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center"
                      >
                        <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">
                          {t("workouts.weekOption", { n: entry.week })}
                        </p>
                        <p className="mt-1 font-[family-name:var(--font-inter)] text-lg font-extrabold tracking-[-0.03em] text-white">
                          {formatKg(entry.bestWeight)}
                        </p>
                        <p className="text-[10px] text-white/35">{t("common.kg")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
