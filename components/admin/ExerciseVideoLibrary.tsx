"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { ExerciseMediaGallery } from "@/components/ExerciseMediaGallery";
import { api } from "@/lib/api-client";
import type { ExerciseVideo } from "@/lib/data";
import { FilePicker } from "@/components/FilePicker";
import {
  MAX_EXERCISE_MEDIA_FILES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  MAX_VIDEO_MB,
} from "@/lib/exercise-video-constants";
import { resolveExerciseMediaItems } from "@/lib/exercise-media-utils";
import { readFileAsDataUrl, readImageDataUrl } from "@/lib/file-upload";

type PendingMedia = {
  id: string;
  name: string;
  type: "image" | "video";
  previewUrl: string;
};

export function ExerciseVideoLibrary({ videos }: { videos: ExerciseVideo[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [mediaFiles, setMediaFiles] = useState<PendingMedia[]>([]);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  async function onFilesSelect(files: File[]) {
    setError("");
    const remaining = MAX_EXERCISE_MEDIA_FILES - mediaFiles.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_EXERCISE_MEDIA_FILES} files per exercise`);
      return;
    }

    const nextFiles = files.slice(0, remaining);
    const pending: PendingMedia[] = [];

    for (const file of nextFiles) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        setError("Only image and video files are supported");
        continue;
      }
      if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
        setError(`Each video must be under ${MAX_VIDEO_MB}MB`);
        continue;
      }
      if (isImage && file.size > MAX_IMAGE_BYTES) {
        setError(`Each image must be under ${MAX_IMAGE_MB}MB`);
        continue;
      }

      try {
        const previewUrl = isImage
          ? await readImageDataUrl(file)
          : await readFileAsDataUrl(file);
        pending.push({
          id: crypto.randomUUID(),
          name: file.name,
          type: isImage ? "image" : "video",
          previewUrl,
        });
      } catch {
        setError("Could not read one of the selected files");
      }
    }

    if (pending.length > 0) {
      setMediaFiles((current) => [...current, ...pending]);
    }
  }

  function removePending(id: string) {
    setMediaFiles((current) => current.filter((file) => file.id !== id));
  }

  async function uploadVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!mediaFiles.length) {
      setError("Please choose at least one image or video");
      return;
    }
    setError("");
    setAdding(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await api("admin/exercise-videos", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          media_files: mediaFiles.map((file) => ({ data_base64: file.previewUrl })),
          tags: tagList,
        }),
      });
      setName("");
      setTags("");
      setMediaFiles([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-wide text-white">
          <Video className="h-6 w-6 text-[#6B93B8]" />
          Exercise Video Library
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload multiple demo photos or videos — clients can swipe through them in
          their program
        </p>
      </div>

      <section className="border border-zinc-800 p-6">
        <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-white">
          Upload New Demo
        </h2>
        <form onSubmit={uploadVideo} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Exercise Title</FieldLabel>
              <Input
                placeholder="e.g., Barbell Squat Demo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <FieldLabel>Tags (comma-separated)</FieldLabel>
              <Input
                placeholder="Legs, Push, Cardio"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Photos &amp; Videos</FieldLabel>
            <div className="flex flex-wrap items-end gap-3">
              <FilePicker
                accept="image/*,video/*"
                multiple
                disabled={adding || mediaFiles.length >= MAX_EXERCISE_MEDIA_FILES}
                onFiles={onFilesSelect}
                className="flex h-12 min-w-[12rem] flex-1 items-center justify-center gap-2 border border-zinc-700 bg-black px-4 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                Choose Files ({mediaFiles.length}/{MAX_EXERCISE_MEDIA_FILES})
              </FilePicker>
              <Button
                type="submit"
                className="h-12 gap-2 bg-[#6B93B8] px-8 text-white hover:bg-[#5a82a7]"
                disabled={adding || mediaFiles.length === 0}
              >
                <Upload className="h-4 w-4" />
                {adding ? "Uploading…" : "Upload"}
              </Button>
            </div>
            <p className="mt-1 text-[10px] text-zinc-600">
              Add up to {MAX_EXERCISE_MEDIA_FILES} images or videos. Clients see
              them one by one with next/previous controls.
            </p>
          </div>

          {mediaFiles.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative overflow-hidden border border-zinc-800 bg-zinc-950"
                >
                  {file.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="h-24 w-32 object-cover"
                    />
                  ) : (
                    <video
                      src={file.previewUrl}
                      className="h-24 w-32 object-cover"
                      muted
                      playsInline
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removePending(file.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white hover:bg-red-500/90"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <p className="max-w-32 truncate px-2 py-1 text-[10px] text-zinc-500">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </section>

      {videos.length === 0 ? (
        <p className="border border-zinc-800 p-12 text-center text-sm text-zinc-500">
          No exercise videos yet. Upload your first demo above.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((v) => {
            const mediaItems = resolveExerciseMediaItems(v);
            return (
              <article
                key={v.id}
                className="overflow-hidden border border-zinc-800 bg-zinc-950"
              >
                <div className="p-3">
                  <ExerciseMediaGallery
                    exerciseId={v.id}
                    mediaItems={mediaItems}
                    title={v.name}
                    streamBasePath="/api/admin/exercise-videos"
                  />
                </div>
                <div className="p-4 pt-0">
                  <p className="font-bold uppercase tracking-wide text-white">
                    {v.name}
                  </p>
                  {mediaItems.length > 1 && (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      {mediaItems.length} demos
                    </p>
                  )}
                  {v.tags && v.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {v.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B93B8]"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
