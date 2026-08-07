"use client";

import { Zap } from "lucide-react";
import { ClientSectionHeading } from "@/components/ClientSectionHeading";
import { StepperInput } from "@/components/StepperInput";
import { useLanguage } from "@/components/LanguageProvider";
import type { CardioLog, ProgramCardio } from "@/lib/data";
import { clientCard } from "@/lib/client-ui";
import { formatProgramCardio } from "@/lib/program-cardio";
import { cn } from "@/lib/utils";

export function WorkoutCardioSection({
  cardio,
  cardioLog,
  errorMessage,
  onChange,
}: {
  cardio: ProgramCardio;
  cardioLog: CardioLog;
  errorMessage?: string;
  onChange: (next: CardioLog) => void;
}) {
  const { t } = useLanguage();

  return (
    <section className="mt-9">
      <ClientSectionHeading className="mb-4">{t("workouts.cardioSection")}</ClientSectionHeading>
      <div className={cn(clientCard, "px-6 py-6 sm:px-7")}>
        <div className="mb-5 flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#6B93B8] bg-gradient-to-br from-[#1C2E40] to-[#2a4560]">
            <Zap className="h-5 w-5 stroke-[#A8C5DC]" strokeWidth={2} />
          </div>
          <div>
            <p className="font-[family-name:var(--font-inter)] text-base font-extrabold tracking-[-0.02em] text-white">
              {t("workouts.cardioTitle")}
            </p>
            <p className="text-xs text-white/45">Target: {formatProgramCardio(cardio)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              {t("workouts.durationMin")}
            </label>
            <StepperInput
              value={cardioLog.duration_minutes}
              onChange={(duration_minutes) => onChange({ ...cardioLog, duration_minutes })}
              inputMode="numeric"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              {t("workouts.distanceKm")}
            </label>
            <StepperInput
              value={cardioLog.distance_km}
              onChange={(distance_km) => onChange({ ...cardioLog, distance_km })}
              step={1}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              {t("workouts.burnKcal")}
            </label>
            <StepperInput
              value={cardioLog.calories_burned}
              onChange={(calories_burned) => onChange({ ...cardioLog, calories_burned })}
              inputMode="numeric"
            />
          </div>
        </div>

        {errorMessage ? <p className="mt-2 text-xs text-red-400">{errorMessage}</p> : null}
      </div>
    </section>
  );
}
