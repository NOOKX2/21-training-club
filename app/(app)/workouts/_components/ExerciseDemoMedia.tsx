import { ExerciseMediaGallery } from "@/components/ExerciseMediaGallery";
import { ExerciseVideoPlayer } from "@/components/ExerciseVideoPlayer";
import type { WorkoutExercise } from "@/lib/data";
import { exerciseMediaClass } from "@/app/(app)/workouts/_components/types";
import { cn } from "@/lib/utils";

export function ExerciseDemoMedia({ exercise }: { exercise: WorkoutExercise }) {
  if (exercise.demo_video?.media_items?.length) {
    return (
      <ExerciseMediaGallery
        exerciseId={exercise.demo_video.id}
        mediaItems={exercise.demo_video.media_items}
        title={exercise.name}
        compact
        className="shrink-0"
      />
    );
  }

  if (exercise.demo_video) {
    return (
      <ExerciseVideoPlayer
        video={exercise.demo_video}
        title={exercise.name}
        compact
        className={exerciseMediaClass}
      />
    );
  }

  if (exercise.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={exercise.image_url}
        alt={exercise.name}
        className={cn(exerciseMediaClass, "shrink-0 object-cover")}
      />
    );
  }

  return null;
}
