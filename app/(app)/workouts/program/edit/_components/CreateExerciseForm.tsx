"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";

export function CreateExerciseForm({
  name,
  saving,
  onNameChange,
  onSave,
  onCancel,
}: {
  name: string;
  saving: boolean;
  onNameChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <FieldLabel>{t("workouts.createExercise")}</FieldLabel>
      <p className="mt-1 mb-3 text-xs text-white/45">{t("workouts.createExerciseHint")}</p>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder={t("workouts.newExerciseNamePlaceholder")}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="min-w-48 flex-1"
          autoFocus
        />
        <Button
          type="button"
          className="h-11 bg-[#6B93B8] px-5 text-white hover:bg-[#5a82a7]"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? t("common.saving") : t("workouts.saveExerciseOption")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 border-white/15"
          disabled={saving}
          onClick={onCancel}
        >
          {t("profile.cancel")}
        </Button>
      </div>
    </div>
  );
}
