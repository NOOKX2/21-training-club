import { youtubeEmbedUrl } from "@/lib/exercise-video-utils";

export type ExerciseVideoSource = {
  id: string;
  video_url?: string;
  has_uploaded_file?: boolean;
};

export function ExerciseVideoPlayer({
  video,
  title,
  compact = false,
  streamBasePath = "/api/exercise-video",
}: {
  video: ExerciseVideoSource;
  title?: string;
  compact?: boolean;
  streamBasePath?: string;
}) {
  const sizeClass = compact
    ? "h-28 w-44 bg-black object-contain"
    : "aspect-video w-full bg-black object-contain";

  if (video.video_url) {
    const embed = youtubeEmbedUrl(video.video_url);
    if (embed) {
      return (
        <iframe
          src={embed}
          title={title ?? "Exercise video"}
          className={compact ? "h-28 w-44 bg-black" : "aspect-video w-full bg-black"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <video
        src={video.video_url}
        controls
        className={sizeClass}
        playsInline
      />
    );
  }

  if (video.has_uploaded_file) {
    return (
      <video
        src={`${streamBasePath}/${video.id}/stream`}
        controls
        className={sizeClass}
        playsInline
      />
    );
  }

  return (
    <div
      className={
        compact
          ? "flex h-28 w-44 items-center justify-center bg-zinc-900 text-xs text-zinc-600"
          : "flex aspect-video w-full items-center justify-center bg-zinc-900 text-sm text-zinc-600"
      }
    >
      No video
    </div>
  );
}
