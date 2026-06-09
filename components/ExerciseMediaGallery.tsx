"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExerciseVideoPlayer } from "@/components/ExerciseVideoPlayer";
import type { ExerciseMediaItem } from "@/lib/data";
import { exerciseMediaStreamPath } from "@/lib/exercise-media-utils";
import { cn } from "@/lib/utils";

export function ExerciseMediaGallery({
  exerciseId,
  mediaItems,
  title,
  compact = false,
  streamBasePath = "/api/exercise-video",
  className,
}: {
  exerciseId: string;
  mediaItems: ExerciseMediaItem[];
  title?: string;
  compact?: boolean;
  streamBasePath?: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  if (!mediaItems.length) return null;

  const current = mediaItems[index];
  const hasMultiple = mediaItems.length > 1;
  const mediaClass = compact
    ? "h-[4.75rem] w-[4.75rem] rounded-lg object-cover sm:h-28 sm:w-44 sm:rounded-xl"
    : "aspect-video w-full rounded-xl object-contain bg-black";

  function goPrev() {
    setIndex((value) => (value === 0 ? mediaItems.length - 1 : value - 1));
  }

  function goNext() {
    setIndex((value) => (value === mediaItems.length - 1 ? 0 : value + 1));
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative overflow-hidden rounded-xl">
        {current.type === "image" && current.has_uploaded_file ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={exerciseMediaStreamPath(streamBasePath, exerciseId, current.id)}
            alt={title ? `${title} demo ${index + 1}` : "Exercise demo"}
            className={cn(mediaClass, "bg-zinc-900")}
          />
        ) : current.type === "video" ? (
          <ExerciseVideoPlayer
            video={{
              id: exerciseId,
              video_url: current.video_url,
              has_uploaded_file: current.has_uploaded_file,
              media_id: current.id,
            }}
            title={title}
            compact={compact}
            streamBasePath={streamBasePath}
            className={compact ? mediaClass : undefined}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center bg-zinc-900 text-xs text-zinc-600",
              mediaClass
            )}
          >
            No media
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90 sm:left-2 sm:h-8 sm:w-8"
              aria-label="Previous demo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90 sm:right-2 sm:h-8 sm:w-8"
              aria-label="Next demo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1.5">
            {mediaItems.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  itemIndex === index ? "bg-[#6B93B8]" : "bg-zinc-700 hover:bg-zinc-500"
                )}
                aria-label={`View demo ${itemIndex + 1}`}
                aria-current={itemIndex === index}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            {index + 1}/{mediaItems.length}
          </span>
        </div>
      )}
    </div>
  );
}
