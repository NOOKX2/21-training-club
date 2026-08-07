"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { FormCheckSubmission } from "@/lib/data";
import { MAX_FORM_CHECK_VIDEO_MB } from "@/lib/form-check-constants";

export function useWorkoutFormChecks({
  day,
  week,
  initialFormChecks = [],
  t,
  setMessages,
}: {
  day: number;
  week: number;
  initialFormChecks?: FormCheckSubmission[];
  t: (key: string) => string;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const router = useRouter();
  const [formChecks, setFormChecks] = useState<Record<string, FormCheckSubmission>>(() => {
    const map: Record<string, FormCheckSubmission> = {};
    for (const fc of initialFormChecks) {
      if (fc.exercise_id) map[fc.exercise_id] = fc;
    }
    return map;
  });
  const [uploadingFormCheckId, setUploadingFormCheckId] = useState<string | null>(null);

  const resetFormChecks = useCallback((initial: FormCheckSubmission[]) => {
    const map: Record<string, FormCheckSubmission> = {};
    for (const fc of initial) {
      if (fc.exercise_id) map[fc.exercise_id] = fc;
    }
    setFormChecks(map);
  }, []);

  const uploadFormCheck = useCallback(
    async (exerciseId: string, exerciseName: string, file: File) => {
      if (file.size > MAX_FORM_CHECK_VIDEO_MB * 1024 * 1024) {
        setMessages((m) => ({
          ...m,
          [exerciseId]: `Video must be under ${MAX_FORM_CHECK_VIDEO_MB}MB`,
        }));
        return;
      }

      setUploadingFormCheckId(exerciseId);
      setMessages((m) => ({ ...m, [exerciseId]: "" }));

      try {
        const video_base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Could not read video file"));
          reader.readAsDataURL(file);
        });

        const result = await api<{ submission: FormCheckSubmission }>("form-checks/submit", {
          method: "POST",
          body: JSON.stringify({
            exercise_id: exerciseId,
            exercise_name: exerciseName,
            week,
            day,
            video_base64,
          }),
        });

        setFormChecks((prev) => ({ ...prev, [exerciseId]: result.submission }));
        setMessages((m) => ({ ...m, [exerciseId]: t("workouts.formCheckUploaded") }));
        router.refresh();
      } catch (err) {
        setMessages((m) => ({
          ...m,
          [exerciseId]: err instanceof Error ? err.message : t("common.uploadFailed"),
        }));
      } finally {
        setUploadingFormCheckId(null);
      }
    },
    [day, router, setMessages, t, week]
  );

  const formCheckButtonLabel = useCallback(
    (exerciseId: string) => {
      const fc = formChecks[exerciseId];
      if (uploadingFormCheckId === exerciseId) return t("workouts.uploading");
      if (!fc) return t("workouts.uploadFormCheck");
      if (fc.status === "reviewed") return t("workouts.reuploadFormCheck");
      return t("workouts.formCheckPending");
    },
    [formChecks, t, uploadingFormCheckId]
  );

  return {
    formChecks,
    uploadingFormCheckId,
    resetFormChecks,
    uploadFormCheck,
    formCheckButtonLabel,
  };
}
