"use client";

import { ClientSectionHeading } from "@/components/ClientSectionHeading";
import { RestDayCard } from "@/components/RestDayCard";
import { useLanguage } from "@/components/LanguageProvider";
import { WorkoutCardioSection } from "@/app/(app)/workouts/_components/WorkoutCardioSection";
import { WorkoutClientHeader } from "@/app/(app)/workouts/_components/WorkoutClientHeader";
import { WorkoutWeekTabs } from "@/app/(app)/workouts/_components/WorkoutWeekTabs";
import { WorkoutDayTabs } from "@/app/(app)/workouts/_components/WorkoutDayTabs";
import { WorkoutExerciseCard } from "@/app/(app)/workouts/_components/WorkoutExerciseCard";
import { WorkoutLoadingState } from "@/app/(app)/workouts/_components/WorkoutLoadingState";
import { WorkoutProgressBar } from "@/app/(app)/workouts/_components/WorkoutProgressBar";
import { WorkoutSaveBar } from "@/app/(app)/workouts/_components/WorkoutSaveBar";
import type { ExerciseLogState } from "@/app/(app)/workouts/_components/types";
import type { CardioLog, FormCheckSubmission, WorkoutDay } from "@/lib/data";
import { useWorkoutClient } from "@/lib/hooks/use-workout-client";
import { bestWeightFromLog } from "@/lib/hooks/workout/workout-client-utils";

export function WorkoutClient({
  userId,
  week,
  day,
  days,
  initialLogs,
  initialCardioLog,
  initialFormChecks = [],
  previousLogs = {},
  contentReady = true,
  activeProgramName = null,
  weeks,
  deletingWeek = false,
  onNavigate,
  onSelectWeek,
  onAddWeek,
  onDeleteWeek,
}: {
  userId: string;
  week: number;
  day: number;
  days: WorkoutDay[];
  initialLogs: Record<string, ExerciseLogState>;
  initialCardioLog: CardioLog;
  initialFormChecks?: FormCheckSubmission[];
  previousLogs?: Record<string, ExerciseLogState>;
  contentReady?: boolean;
  activeProgramName?: string | null;
  weeks: number[];
  deletingWeek?: boolean;
  onNavigate?: (day: number) => void;
  onSelectWeek: (week: number) => void;
  onAddWeek: () => void;
  onDeleteWeek: () => void;
}) {
  const { t } = useLanguage();
  const dayData = days.find((d) => d.day === day);
  const exercises = dayData?.exercises ?? [];
  const workout = useWorkoutClient({
    userId,
    week,
    day,
    exercises,
    initialLogs,
    initialCardioLog,
    initialFormChecks,
    hasCardio: Boolean(dayData?.cardio && !dayData.rest_day),
    onNavigate,
    t,
  });
  const showSaveBar =
    contentReady && !dayData?.rest_day && (exercises.length > 0 || Boolean(dayData?.cardio));
  const showProgressBar =
    showSaveBar && workout.showProgress && workout.totalSets > 0;

  return (
    <div className={showSaveBar ? "pb-24 lg:pb-20" : undefined}>
      <WorkoutClientHeader activeProgramName={activeProgramName} />
      {showProgressBar ? (
        <WorkoutProgressBar
          className="mb-6"
          completedSets={workout.completedSetCount}
          totalSets={workout.totalSets}
        />
      ) : null}
      <WorkoutWeekTabs
        week={week}
        weeks={weeks}
        deleting={deletingWeek}
        onSelect={onSelectWeek}
        onAddWeek={onAddWeek}
        onDeleteWeek={onDeleteWeek}
      />
      <WorkoutDayTabs day={day} onSelect={workout.navigate} />

      {!contentReady ? (
        <WorkoutLoadingState />
      ) : dayData?.rest_day ? (
        <RestDayCard className="mt-2" />
      ) : (
        <>
          <ClientSectionHeading className="mb-4">
            {t("workouts.dayExercises", { day })}
          </ClientSectionHeading>

          <div className="space-y-4">
            {exercises.map((exercise) => (
              <WorkoutExerciseCard
                key={exercise.id}
                exercise={exercise}
                log={workout.logs[exercise.id]}
                previousWeight={bestWeightFromLog(previousLogs[exercise.id])}
                completedSets={workout.completedSets[exercise.id] ?? []}
                formCheck={workout.formChecks[exercise.id]}
                uploadingFormCheck={workout.uploadingFormCheckId === exercise.id}
                formCheckLabel={workout.formCheckButtonLabel(exercise.id)}
                message={workout.messages[exercise.id]}
                onAddSet={() => workout.addSet(exercise.id)}
                onRemoveSet={(setIndex) => workout.removeSet(exercise.id, setIndex)}
                onUpdateSet={(setIndex, field, value) =>
                  workout.updateSet(exercise.id, setIndex, field, value)
                }
                onToggleSetComplete={(setIndex) =>
                  workout.toggleSetComplete(exercise.id, setIndex)
                }
                onFormCheckSelect={(file) => {
                  if (file) void workout.uploadFormCheck(exercise.id, exercise.name, file);
                }}
              />
            ))}
          </div>

          {dayData?.cardio && !dayData.rest_day ? (
            <WorkoutCardioSection
              cardio={dayData.cardio}
              cardioLog={workout.cardioLog}
              errorMessage={workout.messages.cardio}
              onChange={workout.setCardioLog}
            />
          ) : null}
        </>
      )}

      {showSaveBar ? (
        <WorkoutSaveBar
          completedSets={workout.completedSetCount}
          totalSets={workout.totalSets}
          saving={workout.savingAll}
          saved={workout.allSaved}
          errorMessage={workout.messages._all}
          onSave={() => void workout.saveAllLogs()}
        />
      ) : null}
    </div>
  );
}
