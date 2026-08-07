"use client";

import { TrendingUp } from "lucide-react";
import { ComparePhotoColumn } from "@/app/(app)/progress/_components/ComparePhotoColumn";
import { JourneyStatCard } from "@/app/(app)/progress/_components/JourneyStatCard";
import { useLanguage } from "@/components/LanguageProvider";
import { clientCard, clientSectionLabel } from "@/lib/client-ui";
import type { ProgressJourneyStats, ProgressPhoto } from "@/lib/data";
import { cn } from "@/lib/utils";

export function BeforeAfterSection({
  photos,
  beforePhotoId,
  afterPhotoId,
  journeyStats,
  journeyLoading,
  onBeforeSelect,
  onAfterSelect,
}: {
  photos: ProgressPhoto[];
  beforePhotoId: string;
  afterPhotoId: string;
  journeyStats: ProgressJourneyStats | null;
  journeyLoading: boolean;
  onBeforeSelect: (id: string) => void;
  onAfterSelect: (id: string) => void;
}) {
  const { t } = useLanguage();
  const hasPhotos = photos.length > 0;

  return (
    <section className={cn(clientCard, "p-6")}>
      <p className={clientSectionLabel}>{t("progress.beforeAfter")}</p>
      {!hasPhotos ? (
        <div className="mt-6 flex flex-col items-center py-12 text-center">
          <TrendingUp className="mb-4 h-12 w-12 text-white/25" />
          <p className="font-medium text-white">{t("progress.startTracking")}</p>
          <p className="mt-2 max-w-sm text-sm text-white/45">{t("progress.startTrackingHint")}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-6">
          <ComparePhotoColumn
            photos={photos}
            selectedId={beforePhotoId}
            onSelect={onBeforeSelect}
            label={t("progress.before")}
          />
          <ComparePhotoColumn
            photos={photos}
            selectedId={afterPhotoId}
            onSelect={onAfterSelect}
            label={t("progress.after")}
          />
        </div>
      )}

      {hasPhotos ? (
        <div className="mt-6 border-t border-white/10 pt-6">
          <p className={clientSectionLabel}>{t("progress.howYouGotThere")}</p>
          <p className="mt-1 text-xs text-white/40">{t("progress.journeyHint")}</p>

          {journeyLoading ? (
            <p className="mt-5 text-sm text-white/45">{t("progress.calculating")}</p>
          ) : journeyStats ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <JourneyStatCard
                label={t("progress.days")}
                value={String(journeyStats.daysSpent)}
                hint={t("progress.daysHint")}
              />
              <JourneyStatCard
                label={t("progress.trainingDays")}
                value={String(journeyStats.activeTrainingDays)}
                hint={t("progress.trainingDaysHint")}
              />
              <JourneyStatCard
                label={t("progress.totalReps")}
                value={journeyStats.totalReps.toLocaleString()}
                hint={t("progress.totalRepsHint")}
              />
              <JourneyStatCard
                label={t("progress.caloriesVsTdee")}
                value={
                  journeyStats.calorieBalance != null
                    ? journeyStats.calorieBalance < 0
                      ? t("progress.deficit", {
                          amount: Math.abs(Math.round(journeyStats.calorieBalance)).toLocaleString(),
                        })
                      : journeyStats.calorieBalance > 0
                        ? t("progress.surplus", {
                            amount: Math.round(journeyStats.calorieBalance).toLocaleString(),
                          })
                        : t("progress.onTarget")
                    : t("progress.setTdee")
                }
                valueClassName={
                  journeyStats.calorieBalance == null
                    ? undefined
                    : journeyStats.calorieBalance < 0
                      ? "text-red-400"
                      : journeyStats.calorieBalance > 0
                        ? "text-emerald-400"
                        : "text-[#A8C5DC]"
                }
                hint={
                  journeyStats.tdee
                    ? t("progress.tdeeHint", {
                        eaten: journeyStats.totalCaloriesConsumed.toLocaleString(),
                        tdee: journeyStats.tdee.toLocaleString(),
                      })
                    : t("progress.tdeeMissing")
                }
              />
            </div>
          ) : (
            <p className="mt-5 text-sm text-white/45">{t("progress.selectPhotos")}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
