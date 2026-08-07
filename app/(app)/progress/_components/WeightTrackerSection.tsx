"use client";

import { Scale } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { StepperInput } from "@/components/StepperInput";
import { WeightProgressChart } from "@/app/(app)/progress/_components/WeightProgressChart";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/Input";
import {
  formatSigned,
  signedChangeColor,
} from "@/app/(app)/progress/_components/progress-utils";
import {
  clientCard,
  clientCardInner,
  clientSaveButtonClass,
  clientSectionLabel,
} from "@/lib/client-ui";
import type { WeightEntry } from "@/lib/data";
import { cn } from "@/lib/utils";

export function WeightTrackerSection({
  readOnly,
  weight,
  height,
  initialHeight,
  last,
  hasWeightHistory,
  changePercent,
  changeKg,
  bmi,
  avgPerTime,
  history,
  onWeightChange,
  onHeightChange,
  onLogWeight,
}: {
  readOnly: boolean;
  weight: string;
  height: string;
  initialHeight: number | null;
  last?: WeightEntry;
  hasWeightHistory: boolean;
  changePercent: number;
  changeKg: number;
  bmi: number | null;
  avgPerTime: number | null;
  history: WeightEntry[];
  onWeightChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onLogWeight: () => void;
}) {
  const { t } = useLanguage();

  return (
    <section className={cn(clientCard, "p-6")}>
      <p className={clientSectionLabel}>{t("progress.weightTracker")}</p>
      {!readOnly ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t("progress.currentWeight")}</FieldLabel>
              <StepperInput value={weight} onChange={onWeightChange} step={0.5} />
            </div>
            <div>
              <FieldLabel>{t("progress.heightCm")}</FieldLabel>
              <StepperInput
                value={height}
                onChange={onHeightChange}
                step={1}
                inputMode="numeric"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="save"
            className={cn("mt-5", clientSaveButtonClass)}
            onClick={onLogWeight}
          >
            {t("progress.logWeight")}
          </Button>
        </>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>{t("progress.currentWeight")}</FieldLabel>
            <p className="text-lg font-bold text-white">{last ? `${last.weight} kg` : "—"}</p>
          </div>
          <div>
            <FieldLabel>{t("progress.heightCm")}</FieldLabel>
            <p className="text-lg font-bold text-white">
              {initialHeight != null
                ? `${initialHeight} cm`
                : last?.height
                  ? `${last.height} cm`
                  : "—"}
            </p>
          </div>
        </div>
      )}

      <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4", readOnly ? "mt-5" : "mt-6")}>
        <StatBox
          label={t("progress.totalChange")}
          value={hasWeightHistory ? formatSigned(changePercent, "%") : "—"}
          valueClassName={hasWeightHistory ? signedChangeColor(changePercent) : "text-white"}
        />
        <StatBox
          label={t("progress.changeKg")}
          value={hasWeightHistory ? formatSigned(changeKg, " kg") : "—"}
          valueClassName={hasWeightHistory ? signedChangeColor(changeKg) : "text-white"}
        />
        <StatBox
          label={t("progress.currentBmi")}
          value={bmi != null ? bmi.toFixed(1) : "—"}
        />
        <StatBox
          label={t("progress.volTime")}
          value={
            avgPerTime != null ? (
              <>
                {formatSigned(avgPerTime, "")}
                <span className="ml-1 text-sm font-normal text-white/45">kg</span>
              </>
            ) : (
              "—"
            )
          }
          valueClassName={avgPerTime == null ? "text-white" : signedChangeColor(avgPerTime)}
        />
      </div>

      {!hasWeightHistory ? (
        <div className="mt-10 flex flex-col items-center py-12 text-white/45">
          <Scale className="mb-4 h-12 w-12 stroke-1" />
          <p className="text-sm">{t("progress.startWeightTracking")}</p>
        </div>
      ) : (
        <div className="mt-8">
          <p className={clientSectionLabel}>{t("progress.weightProgress")}</p>
          <WeightProgressChart history={history} />
        </div>
      )}
    </section>
  );
}

function StatBox({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className={cn(clientCardInner, "px-4 py-3 text-center")}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", valueClassName)}>{value}</p>
    </div>
  );
}
