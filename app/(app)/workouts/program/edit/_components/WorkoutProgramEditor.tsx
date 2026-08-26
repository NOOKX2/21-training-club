"use client";

import Link from "next/link";
import { ChevronLeft, Pencil, Plus, Save } from "lucide-react";
import { ClientPageHeader } from "@/components/ClientPageHeader";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { RestDayToggle } from "@/components/RestDayToggle";
import { CreateExerciseForm } from "@/app/(app)/workouts/program/edit/_components/CreateExerciseForm";
import { ExerciseRow } from "@/app/(app)/workouts/program/edit/_components/ExerciseRow";
import { ProgramDayTabs } from "@/app/(app)/workouts/program/edit/_components/ProgramDayTabs";
import { useWorkoutProgramEditor } from "@/lib/hooks/use-workout-program-editor";
import { clientCard, clientSaveButtonClass } from "@/lib/client-ui";
import { openExercisePickerHref } from "@/lib/workout-exercise-picker";
import type {
  ExerciseVideoOption,
  UserWorkoutDayDoc,
} from "@/lib/workout-program-shared";
import { cn } from "@/lib/utils";

export function WorkoutProgramEditor({
  programId,
  programName,
  returnDay,
  initialDays,
  initialVideos,
  startInEditMode = false,
}: {
  programId: string;
  programName: string;
  returnDay: number;
  initialDays: UserWorkoutDayDoc[];
  initialVideos: ExerciseVideoOption[];
  startInEditMode?: boolean;
}) {
  const { t } = useLanguage();
  const editor = useWorkoutProgramEditor({
    programId,
    returnDay,
    initialProgramName: programName,
    initialDays,
    initialVideos,
    startInEditMode,
    t,
  });
  const returnHref = `/workouts/program`;
  const showSavedState = !editor.isEditing && editor.dayIsSaved;
  const pickerVideoIds = editor.draft.exercises
    .map((exercise) => exercise.demo_video_id)
    .filter((id): id is string => Boolean(id));
  const displayTitle =
    editor.programName.trim() || t("workouts.programEditorTitle");

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={returnHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("workouts.backToProgramList")}
      </Link>

      <ClientPageHeader
        eyebrow={t("workouts.programEditorEyebrow")}
        title={displayTitle}
        subtitle={t("workouts.programEditorHint")}
        className="mb-6"
      />

      <div className={cn(clientCard, "mb-6 space-y-3 px-5 py-4 sm:px-6")}>
        <FieldLabel>{t("workouts.programNameLabel")}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          <Input
            value={editor.programName}
            onChange={(event) => editor.setProgramName(event.target.value)}
            onBlur={() => void editor.persistProgramName()}
            placeholder={t("workouts.programNamePlaceholder")}
            className="min-w-0 flex-1"
          />
        </div>
      </div>

      <div className="space-y-6">
        <ProgramDayTabs editDay={editor.editDay} onSelect={editor.selectDay} />

        <div className={cn(clientCard, "space-y-5 px-5 py-6 sm:px-6")}>
          <RestDayToggle
            checked={editor.draft.restDay}
            onChange={editor.setRestDay}
            disabled={!editor.isEditing}
            title={t("workouts.restDayBadge")}
            description={t("workouts.restDayEditorHint")}
          />

          {!editor.draft.restDay && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-[family-name:var(--font-inter)] text-sm font-bold uppercase tracking-wide text-white">
                  {t("workouts.dayExercises", { day: editor.editDay })}
                </p>
                {editor.isEditing && !editor.createExerciseOpen ? (
                  <button
                    type="button"
                    onClick={() => editor.setCreateExerciseOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#6B93B8] transition-colors hover:text-[#A8C5DC]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("workouts.createNewExercise")}
                  </button>
                ) : null}
              </div>

              {editor.isEditing && editor.createExerciseOpen ? (
                <CreateExerciseForm
                  name={editor.newExerciseName}
                  saving={editor.creatingExercise}
                  onNameChange={editor.setNewExerciseName}
                  onSave={() => void editor.createExerciseOption()}
                  onCancel={editor.closeCreateExercise}
                />
              ) : null}

              {editor.draft.exercises.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 bg-black/25 px-4 py-10 text-center">
                  <p className="text-sm text-white/40">{t("workouts.noExercisesYet")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <div className="min-w-0 flex-1" aria-hidden />
                    <p className="w-16 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                      {t("workouts.sets")}
                    </p>
                    <p className="w-20 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                      {t("workouts.reps")}
                    </p>
                    <div className="w-10 shrink-0" aria-hidden />
                  </div>
                  {editor.draft.exercises.map((exercise) => (
                    <ExerciseRow
                      key={exercise.id}
                      exercise={exercise}
                      readOnly={!editor.isEditing}
                      programId={programId}
                      editDay={editor.editDay}
                      existingVideoIds={pickerVideoIds}
                      onUpdate={(patch) => editor.updateExercise(exercise.id, patch)}
                      onRemove={() => editor.removeExercise(exercise.id)}
                    />
                  ))}
                </div>
              )}

              {editor.isEditing ? (
                <Link
                  href={openExercisePickerHref({
                    programId,
                    day: editor.editDay,
                    existingVideoIds: pickerVideoIds,
                  })}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6B93B8] text-sm font-bold text-white transition-colors hover:bg-[#5a82a7]"
                >
                  <Plus className="h-4 w-4" />
                  {t("workouts.addExercise")}
                </Link>
              ) : null}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!editor.isEditing && editor.dayIsSaved ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 gap-2 border-white/20 text-white hover:bg-white/10 sm:flex-none sm:px-6"
                onClick={editor.startEditing}
              >
                <Pencil className="h-4 w-4" />
                {t("workouts.editProgram")}
              </Button>
            ) : null}

            <Button
              type="button"
              variant="save"
              className={cn(
                clientSaveButtonClass,
                "h-11 flex-1 gap-2 sm:flex-none",
                showSavedState &&
                  "border-white bg-white text-black hover:bg-white hover:text-black"
              )}
              disabled={editor.saving || !editor.isEditing}
              onClick={() => void editor.saveDay()}
            >
              <Save className="h-4 w-4" />
              {editor.saving
                ? t("common.saving")
                : showSavedState
                  ? t("workouts.programSavedSuccess")
                  : t("workouts.saveProgram")}
            </Button>
          </div>
        </div>

        {editor.feedback.error ? (
          <p className="text-sm text-red-400">{editor.feedback.error}</p>
        ) : null}
        {editor.feedback.message ? (
          <p className="text-sm text-[#A8C5DC]">{editor.feedback.message}</p>
        ) : null}
      </div>
    </div>
  );
}
