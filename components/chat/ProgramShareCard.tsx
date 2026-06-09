"use client";

import { ClipboardList, Dumbbell } from "lucide-react";
import { ExerciseVideoPlayer } from "@/components/ExerciseVideoPlayer";
import type { ProgramSharePayload } from "@/lib/program-share-types";
import { formatProgramCardio } from "@/lib/program-cardio";
import { cn } from "@/lib/utils";

function ProgramPreviewMedia({
  exercise,
  className,
}: {
  exercise: ProgramSharePayload["exercises"][number];
  className?: string;
}) {
  const demo = exercise.demo_video;
  const hasVideo =
    demo &&
    (demo.video_url || demo.has_uploaded_file);

  if (hasVideo && demo) {
    return (
      <ExerciseVideoPlayer
        video={{
          id: demo.id,
          video_url: demo.video_url,
          has_uploaded_file: demo.has_uploaded_file,
          media_id: demo.media_id,
        }}
        title={exercise.name}
        compact
        expandable={false}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  if (exercise.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={exercise.image_url}
        alt={exercise.name}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-[#6B93B8]/15 text-[#6B93B8]",
        className
      )}
    >
      <Dumbbell className="h-10 w-10" strokeWidth={1.5} />
    </div>
  );
}

export function ProgramShareCard({
  share,
  className,
}: {
  share: ProgramSharePayload;
  className?: string;
}) {
  const preview = share.exercises[0];
  const extraCount = Math.max(0, share.exercises.length - 1);
  const cardioLine = share.cardio ? formatProgramCardio(share.cardio) : "";

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-40 w-full shrink-0 overflow-hidden bg-black/40 sm:h-auto sm:min-h-[9.5rem] sm:w-36">
          {preview ? (
            <ProgramPreviewMedia exercise={preview} />
          ) : (
            <div className="flex h-full min-h-[9.5rem] items-center justify-center bg-[#6B93B8]/10">
              <ClipboardList className="h-10 w-10 text-[#6B93B8]/60" />
            </div>
          )}
          {extraCount > 0 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              +{extraCount} more
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 border-t border-white/10 p-3.5 sm:border-l sm:border-t-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6B93B8]">
            Program
          </p>
          <p className="mt-1 text-sm font-bold text-white">
            Week {share.week} · Day {share.day}
          </p>

          <ul className="mt-3 space-y-1.5">
            {share.exercises.map((exercise) => (
              <li
                key={`${exercise.name}-${exercise.target_sets}-${exercise.target_reps}`}
                className="text-xs leading-relaxed text-white/80"
              >
                <span className="font-semibold text-white">{exercise.name}</span>
                <span className="text-white/55">
                  {" "}
                  — {exercise.target_sets} sets × {exercise.target_reps} reps
                </span>
              </li>
            ))}
          </ul>

          {cardioLine && (
            <p className="mt-2 text-xs text-white/65">
              <span className="font-semibold text-[#A8C5DC]">Cardio:</span> {cardioLine}
            </p>
          )}

          {share.question && (
            <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-white/90">
              <span className="mr-1">❓</span>
              {share.question}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
