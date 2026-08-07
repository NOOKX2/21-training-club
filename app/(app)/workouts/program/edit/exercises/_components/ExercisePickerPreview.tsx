"use client";

import { useState, type MouseEvent } from "react";
import { Play } from "lucide-react";
import {
  ExerciseVideoModal,
  hasPlayableVideo,
} from "@/components/ExerciseVideoPlayer";
import { useLanguage } from "@/components/LanguageProvider";
import { exerciseMediaStreamPath } from "@/lib/exercise-media-utils";
import { youtubeThumbnailUrl } from "@/lib/exercise-video-utils";
import {
  exercisePickerVideoSource,
  type ExercisePickerItem,
} from "@/lib/workout-exercise-picker";

export function ExercisePickerPreview({
  exercise,
}: {
  exercise: ExercisePickerItem;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const preview = exercise.preview;
  const video = exercisePickerVideoSource(exercise);
  const canPlay = Boolean(video && hasPlayableVideo(video));

  if (!preview) return null;

  function openVideo(event: MouseEvent) {
    event.stopPropagation();
    if (canPlay) setOpen(true);
  }

  const previewContent = (() => {
    if (preview.type === "image" && preview.has_uploaded_file && preview.media_id) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={exerciseMediaStreamPath(
            "/api/exercise-video",
            exercise.id,
            preview.media_id
          )}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      );
    }

    const videoUrl = preview.video_url?.trim();
    if (videoUrl) {
      const thumbnail = youtubeThumbnailUrl(videoUrl);
      if (thumbnail) {
        return (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white/90">
                <Play className="h-5 w-5 fill-current" />
              </div>
            </div>
          </>
        );
      }

      return (
        <video
          src={videoUrl}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      );
    }

    if (preview.has_uploaded_file && preview.media_id) {
      return (
        <>
          <video
            src={exerciseMediaStreamPath(
              "/api/exercise-video",
              exercise.id,
              preview.media_id
            )}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white/90">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
        </>
      );
    }

    return null;
  })();

  if (!previewContent) return null;

  return (
    <>
      <button
        type="button"
        onClick={openVideo}
        disabled={!canPlay}
        className="absolute inset-0 z-[1] disabled:cursor-default"
        aria-label={
          canPlay
            ? t("workouts.exercisePickerPlayVideo", { name: exercise.name })
            : undefined
        }
      >
        {previewContent}
      </button>
      {video ? (
        <ExerciseVideoModal
          open={open}
          onClose={() => setOpen(false)}
          video={video}
          title={exercise.name}
        />
      ) : null}
    </>
  );
}
