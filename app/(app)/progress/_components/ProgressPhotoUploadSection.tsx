"use client";

import { Camera } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { StepperInput } from "@/components/StepperInput";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { clientCard, clientSectionLabel } from "@/lib/client-ui";
import { MOBILE_FILE_INPUT_CLASS } from "@/lib/file-upload";
import { cn } from "@/lib/utils";

export function ProgressPhotoUploadSection({
  fileInputRef,
  photoWeight,
  notes,
  photoPreview,
  uploadingPhoto,
  photoError,
  photoMessage,
  onPhotoWeightChange,
  onNotesChange,
  onPhotoSelect,
  onOpenPicker,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  photoWeight: string;
  notes: string;
  photoPreview: string;
  uploadingPhoto: boolean;
  photoError: string;
  photoMessage: string;
  onPhotoWeightChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onPhotoSelect: (file: File | null) => void;
  onOpenPicker: () => void;
}) {
  const { t } = useLanguage();

  return (
    <section className={cn(clientCard, "p-6")}>
      <p className={clientSectionLabel}>{t("progress.uploadPhoto")}</p>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>{t("progress.currentWeightShort")}</FieldLabel>
          <StepperInput value={photoWeight} onChange={onPhotoWeightChange} step={0.5} />
        </div>
        <div>
          <FieldLabel>{t("progress.notes")}</FieldLabel>
          <Input
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t("progress.notesPlaceholder")}
          />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={MOBILE_FILE_INPUT_CLASS}
        aria-hidden
        tabIndex={-1}
        onChange={(e) => onPhotoSelect(e.target.files?.[0] ?? null)}
      />
      {photoPreview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoPreview}
          alt="Selected progress photo"
          className="mt-4 aspect-square w-full max-w-xs rounded-xl object-cover"
        />
      ) : null}
      {photoError ? <p className="mt-4 text-sm text-red-400">{photoError}</p> : null}
      {photoMessage ? <p className="mt-4 text-sm text-[#6B93B8]">{photoMessage}</p> : null}
      <Button
        type="button"
        variant="save"
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 text-sm"
        onClick={onOpenPicker}
        disabled={uploadingPhoto}
      >
        <Camera className="h-4 w-4" />
        {uploadingPhoto ? t("progress.uploading") : t("progress.takeUploadPhoto")}
      </Button>
    </section>
  );
}
