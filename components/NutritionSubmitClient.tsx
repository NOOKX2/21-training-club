"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, X } from "lucide-react";
import { FilePicker } from "@/components/FilePicker";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { NutritionHeader } from "@/components/NutritionHeader";
import { useMuscleReward } from "@/components/MuscleStreakContext";
import { api } from "@/lib/api-client";
import { clientCard, clientField } from "@/lib/client-ui";
import type { MealSubmission } from "@/lib/data";
import { getEffectiveMealMacros } from "@/lib/nutrition-utils";
import { readImageDataUrl } from "@/lib/file-upload";
import { localDateKey, nutritionReturnPath } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const MEAL_OPTION_KEYS = [
  { value: 1, labelKey: "nutrition.meal1" },
  { value: 2, labelKey: "nutrition.meal2" },
  { value: 3, labelKey: "nutrition.meal3" },
  { value: 4, labelKey: "nutrition.meal4" },
] as const;

export function NutritionSubmitClient({
  userId,
  meal,
  mealDate,
}: {
  userId: string;
  meal?: MealSubmission;
  mealDate?: string | null;
}) {
  const isEdit = Boolean(meal);
  const initialMacros = meal ? getEffectiveMealMacros(meal) : { protein: 0, carbs: 0, fat: 0 };
  const router = useRouter();
  const { t } = useLanguage();
  const { celebrateMuscleTask } = useMuscleReward();
  const [mealNumber, setMealNumber] = useState(meal?.meal_number ?? 1);
  const [customName, setCustomName] = useState(meal?.custom_name ?? "");
  const [weight, setWeight] = useState(meal?.weight ?? "");
  const [description, setDescription] = useState(meal?.description ?? "");
  const [photo, setPhoto] = useState(meal?.photo_base64 ?? "");
  const [protein, setProtein] = useState(
    initialMacros.protein ? String(initialMacros.protein) : ""
  );
  const [carbs, setCarbs] = useState(initialMacros.carbs ? String(initialMacros.carbs) : "");
  const [fat, setFat] = useState(initialMacros.fat ? String(initialMacros.fat) : "");
  const [photoName, setPhotoName] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const returnPath = nutritionReturnPath(mealDate);

  async function onPhoto(file: File) {
    setPhotoLoading(true);
    setError("");
    try {
      const dataUrl = await readImageDataUrl(file);
      setPhoto(dataUrl);
      setPhotoName(file.name);
    } catch {
      setPhoto("");
      setPhotoName("");
      setError(t("nutrition.photoReadError"));
    } finally {
      setPhotoLoading(false);
    }
  }

  async function submitMeal(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) {
      setError(t("nutrition.photoRequired"));
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        meal_number: mealNumber,
        meal_type: customName ? "custom" : "main",
        custom_name: customName,
        photo_base64: photo,
        description,
        weight,
      };
      if (isEdit && meal) {
        await api(`nutrition/meals-v2/${meal.id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...payload,
            protein: protein === "" ? 0 : Number(protein),
            carbs: carbs === "" ? 0 : Number(carbs),
            fat: fat === "" ? 0 : Number(fat),
          }),
        });
      } else {
        await api("nutrition/meals-v2", {
          method: "POST",
          body: JSON.stringify({
            user_id: userId,
            ...(mealDate ? { meal_date: mealDate } : {}),
            ...payload,
          }),
        });
        celebrateMuscleTask("meal");
      }
      router.push(returnPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-0">
      <NutritionHeader
        showAddButton={false}
        selectedDate={mealDate ?? localDateKey(new Date())}
      />

      <form onSubmit={submitMeal} className={cn(clientCard, "mx-auto mt-10 max-w-2xl p-8")}>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase tracking-wide text-white">
            {isEdit ? t("nutrition.editNutritionTitle") : t("nutrition.submitTitle")}
          </h2>
          <Link
            href={returnPath}
            className="text-zinc-400 transition-colors hover:text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel>{t("nutrition.mealNumber")}</FieldLabel>
              <select
                value={mealNumber}
                onChange={(e) => setMealNumber(Number(e.target.value))}
                className={cn("w-full px-4 py-3 text-sm text-white focus:outline-none", clientField)}
              >
                {MEAL_OPTION_KEYS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {t(m.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>{t("nutrition.customMealName")}</FieldLabel>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t("nutrition.customMealPlaceholder")}
              />
            </div>
          </div>

          <div>
            <FieldLabel>{t("nutrition.weightGrams")}</FieldLabel>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="250"
            />
          </div>

          <div>
            <FieldLabel>{t("nutrition.mealDescription")}</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("nutrition.mealDescriptionPlaceholder")}
              rows={5}
              className={cn("w-full resize-none px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none", clientField)}
            />
          </div>

          {isEdit ? (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
                {t("nutrition.macrosSection")}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel>{t("nutrition.protein")} (g)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <FieldLabel>{t("nutrition.carb")} (g)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <FieldLabel>{t("nutrition.fat")} (g)</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <FieldLabel>{t("nutrition.mealPhoto")}</FieldLabel>
            <FilePicker
              accept="image/*"
              disabled={photoLoading || submitting}
              onFile={onPhoto}
              className={cn(
                "flex h-14 w-full items-center justify-center gap-2 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-60",
                clientField
              )}
            >
              <Camera className="h-5 w-5" />
              {photoLoading
                ? t("common.loadingPhoto")
                : photoName
                  ? photoName
                  : t("nutrition.takeUploadPhoto")}
            </FilePicker>
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt="Meal preview"
                className="mt-4 max-h-48 w-full object-cover"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            className="h-14 w-full text-sm"
            disabled={submitting || photoLoading || !photo}
          >
            {submitting
              ? isEdit
                ? t("nutrition.saving")
                : t("nutrition.submitting")
              : isEdit
                ? t("nutrition.saveMeal")
                : t("nutrition.submitToCoach")}
          </Button>

          <p className="text-center text-xs text-zinc-500">
            {t("nutrition.coachReviewNote")}
          </p>
        </div>
      </form>
    </div>
  );
}
