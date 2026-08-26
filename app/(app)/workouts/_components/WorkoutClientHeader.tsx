"use client";

import Link from "next/link";
import { ChartColumn, ListPlus } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { clientPageEyebrow, clientPageTitle } from "@/lib/client-ui";

export function WorkoutClientHeader({
  activeProgramName,
}: {
  activeProgramName?: string | null;
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className={clientPageEyebrow}>
          {activeProgramName ?? t("workouts.eyebrow")}
        </p>
        <h1 className={clientPageTitle}>{t("workouts.title")}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/workouts/compare?day=1"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/15 px-4 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:border-white/30 hover:bg-white/5"
        >
          <ChartColumn className="h-4 w-4" />
          {t("workouts.weekCompare")}
        </Link>
        <Link
          href="/workouts/program"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/15 px-4 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:border-white/30 hover:bg-white/5"
        >
          <ListPlus className="h-4 w-4" />
          {t("workouts.manageMyProgram")}
        </Link>
      </div>
    </div>
  );
}
