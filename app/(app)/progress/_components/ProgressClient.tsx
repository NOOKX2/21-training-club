"use client";

import { ClientPageHeader } from "@/components/ClientPageHeader";
import { useLanguage } from "@/components/LanguageProvider";
import { BeforeAfterSection } from "@/app/(app)/progress/_components/BeforeAfterSection";
import { ProgressPhotoUploadSection } from "@/app/(app)/progress/_components/ProgressPhotoUploadSection";
import { WeightTrackerSection } from "@/app/(app)/progress/_components/WeightTrackerSection";
import type { ProgressPhoto, WeightEntry } from "@/lib/data";
import { useProgressClient } from "@/lib/hooks/use-progress-client";

export function ProgressClient({
  userId,
  initialHistory,
  initialPhotos,
  initialHeight,
  readOnly = false,
}: {
  userId: string;
  initialHistory: WeightEntry[];
  initialPhotos: ProgressPhoto[];
  initialHeight: number | null;
  readOnly?: boolean;
}) {
  const { t } = useLanguage();
  const progress = useProgressClient({
    userId,
    initialHistory,
    initialPhotos,
    initialHeight,
    t,
  });

  return (
    <div className="space-y-8">
      <ClientPageHeader eyebrow={t("progress.eyebrow")} title={t("progress.title")} />

      {progress.message ? <p className="text-sm text-[#6B93B8]">{progress.message}</p> : null}
      {progress.error ? <p className="text-sm text-red-400">{progress.error}</p> : null}

      <WeightTrackerSection
        readOnly={readOnly}
        weight={progress.weight}
        height={progress.height}
        initialHeight={initialHeight}
        last={progress.last}
        hasWeightHistory={progress.hasWeightHistory}
        changePercent={progress.changePercent}
        changeKg={progress.changeKg}
        bmi={progress.bmi}
        avgPerTime={progress.avgPerTime}
        history={progress.history}
        onWeightChange={progress.setWeight}
        onHeightChange={progress.setHeight}
        onLogWeight={() => void progress.logWeight()}
      />

      {!readOnly ? (
        <ProgressPhotoUploadSection
          fileInputRef={progress.fileInputRef}
          photoWeight={progress.photoWeight}
          notes={progress.notes}
          photoPreview={progress.photoPreview}
          uploadingPhoto={progress.uploadingPhoto}
          photoError={progress.photoError}
          photoMessage={progress.photoMessage}
          onPhotoWeightChange={progress.setPhotoWeight}
          onNotesChange={progress.setNotes}
          onPhotoSelect={(file) => void progress.onPhotoSelect(file)}
          onOpenPicker={progress.openPhotoPicker}
        />
      ) : null}

      <BeforeAfterSection
        photos={progress.photos}
        beforePhotoId={progress.beforePhotoId}
        afterPhotoId={progress.afterPhotoId}
        journeyStats={progress.journeyStats}
        journeyLoading={progress.journeyLoading}
        onBeforeSelect={progress.setBeforePhotoId}
        onAfterSelect={progress.setAfterPhotoId}
      />
    </div>
  );
}
