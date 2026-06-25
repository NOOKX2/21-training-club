"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Pencil, Tag, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { ExerciseMediaGallery } from "@/components/ExerciseMediaGallery";
import { api } from "@/lib/api-client";
import type { ExerciseVideo } from "@/lib/data";
import { adminVideosKey } from "@/lib/admin-page-keys";
import type { AdminVideosPageData } from "@/lib/hooks/use-admin-page";
import { FilePicker } from "@/components/FilePicker";
import {
  MAX_EXERCISE_MEDIA_FILES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  MAX_VIDEO_MB,
} from "@/lib/exercise-video-constants";
import { resolveExerciseMediaItems, exerciseMediaStreamPath } from "@/lib/exercise-media-utils";
import { readFileAsDataUrl, readImageDataUrl } from "@/lib/file-upload";

type PendingMedia = {
  id: string;
  name: string;
  type: "image" | "video";
  previewUrl: string;
};

async function buildPendingMediaFromFiles(
  files: File[],
  currentCount: number
): Promise<{ pending: PendingMedia[]; error?: string }> {
  const remaining = MAX_EXERCISE_MEDIA_FILES - currentCount;
  if (remaining <= 0) {
    return {
      pending: [],
      error: `Maximum ${MAX_EXERCISE_MEDIA_FILES} files per exercise`,
    };
  }

  const nextFiles = files.slice(0, remaining);
  const pending: PendingMedia[] = [];
  let error = "";

  for (const file of nextFiles) {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      error = "Only image and video files are supported";
      continue;
    }
    if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      error = `Each video must be under ${MAX_VIDEO_MB}MB`;
      continue;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      error = `Each image must be under ${MAX_IMAGE_MB}MB`;
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
      error = "Could not read one of the selected files";
    }
  }

  return { pending, error: error || undefined };
}

export function ExerciseVideoLibrary({ videos }: { videos: ExerciseVideo[] }) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [items, setItems] = useState(videos);
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [mediaFiles, setMediaFiles] = useState<PendingMedia[]>([]);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setItems(videos);
  }, [videos]);

  function updateCachedVideo(videoId: string, patch: Partial<ExerciseVideo>) {
    setItems((current) =>
      current.map((video) =>
        video.id === videoId ? { ...video, ...patch } : video
      )
    );
    void mutate(
      adminVideosKey(),
      (current?: AdminVideosPageData) =>
        current
          ? {
              videos: current.videos.map((video) =>
                video.id === videoId ? { ...video, ...patch } : video
              ),
            }
          : current,
      { revalidate: false }
    );
  }

  async function onFilesSelect(files: File[]) {
    setError("");
    const { pending, error: fileError } = await buildPendingMediaFromFiles(
      files,
      mediaFiles.length
    );
    if (fileError) setError(fileError);
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
          ...(mediaFiles.length > 0
            ? {
                media_files: mediaFiles.map((file) => ({
                  data_base64: file.previewUrl,
                })),
              }
            : {}),
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
                disabled={adding || !name.trim()}
              >
                <Upload className="h-4 w-4" />
                {adding ? "Adding…" : mediaFiles.length > 0 ? "Upload" : "Add"}
              </Button>
            </div>
            <p className="mt-1 text-[10px] text-zinc-600">
              Photos and videos are optional. Add up to {MAX_EXERCISE_MEDIA_FILES}{" "}
              images or videos — clients see them one by one with next/previous
              controls.
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

      {items.length === 0 ? (
        <p className="border border-zinc-800 p-12 text-center text-sm text-zinc-500">
          No exercise videos yet. Upload your first demo above.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((v) => {
            const mediaItems = resolveExerciseMediaItems(v);
            return (
              <ExerciseVideoCard
                key={v.id}
                video={v}
                mediaItems={mediaItems}
                onUpdated={(patch) => updateCachedVideo(v.id, patch)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function tagsToInput(tags?: string[]) {
  return tags?.join(", ") ?? "";
}

function parseTagsInput(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function tagsEqual(a?: string[], b?: string[]) {
  const left = a ?? [];
  const right = b ?? [];
  if (left.length !== right.length) return false;
  return left.every((tag, index) => tag === right[index]);
}

function ExerciseVideoCard({
  video,
  mediaItems,
  onUpdated,
}: {
  video: ExerciseVideo;
  mediaItems: ReturnType<typeof resolveExerciseMediaItems>;
  onUpdated: (patch: Partial<ExerciseVideo>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(video.name);
  const [tagsDraft, setTagsDraft] = useState(tagsToInput(video.tags));
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<PendingMedia[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const keptMediaCount =
    mediaItems.filter((item) => !removedMediaIds.includes(item.id)).length +
    newMediaFiles.length;

  useEffect(() => {
    if (!editing) {
      setNameDraft(video.name);
      setTagsDraft(tagsToInput(video.tags));
      setRemovedMediaIds([]);
      setNewMediaFiles([]);
    }
  }, [video.name, video.tags, video.id, editing]);

  function cancelEdit() {
    setNameDraft(video.name);
    setTagsDraft(tagsToInput(video.tags));
    setRemovedMediaIds([]);
    setNewMediaFiles([]);
    setEditing(false);
    setError("");
  }

  async function onEditFilesSelect(files: File[]) {
    setError("");
    const { pending, error: fileError } = await buildPendingMediaFromFiles(
      files,
      keptMediaCount
    );
    if (fileError) setError(fileError);
    if (pending.length > 0) {
      setNewMediaFiles((current) => [...current, ...pending]);
    }
  }

  function toggleRemoveMedia(mediaId: string) {
    setRemovedMediaIds((current) =>
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId]
    );
  }

  function removeNewMedia(id: string) {
    setNewMediaFiles((current) => current.filter((file) => file.id !== id));
  }

  async function saveDetails() {
    const trimmedName = nameDraft.trim();
    const nextTags = parseTagsInput(tagsDraft);
    const hasMediaChanges =
      removedMediaIds.length > 0 || newMediaFiles.length > 0;
    const metadataChanged =
      trimmedName !== video.name || !tagsEqual(nextTags, video.tags);

    if (!trimmedName) {
      setError("Exercise title is required");
      return;
    }
    if (!metadataChanged && !hasMediaChanges) {
      cancelEdit();
      return;
    }
    if (hasMediaChanges && keptMediaCount === 0) {
      setError("At least one image or video is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await api<ExerciseVideo>(`admin/exercise-videos/${video.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: trimmedName,
          tags: nextTags,
          ...(removedMediaIds.length > 0
            ? { remove_media_ids: removedMediaIds }
            : {}),
          ...(newMediaFiles.length > 0
            ? {
                add_media_files: newMediaFiles.map((file) => ({
                  data_base64: file.previewUrl,
                })),
              }
            : {}),
        }),
      });
      onUpdated({
        name: updated.name,
        tags: updated.tags,
        media_items: updated.media_items,
        video_url: updated.video_url,
        video_file_id: updated.video_file_id,
      });
      setEditing(false);
      setRemovedMediaIds([]);
      setNewMediaFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="overflow-hidden border border-zinc-800 bg-zinc-950">
      <div className="p-3">
        {editing ? (
          <div className="space-y-3">
            <FieldLabel>Current Photos &amp; Videos</FieldLabel>
            <div className="flex flex-wrap gap-3">
              {mediaItems.map((item) => {
                const removed = removedMediaIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative overflow-hidden border bg-zinc-900 ${
                      removed ? "border-red-900 opacity-40" : "border-zinc-800"
                    }`}
                  >
                    {item.type === "image" && item.has_uploaded_file ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={exerciseMediaStreamPath(
                          "/api/admin/exercise-videos",
                          video.id,
                          item.id
                        )}
                        alt={video.name}
                        className="h-24 w-32 object-cover"
                      />
                    ) : item.video_url ? (
                      <div className="flex h-24 w-32 items-center justify-center px-2 text-center text-[10px] uppercase tracking-wide text-zinc-400">
                        YouTube / URL
                      </div>
                    ) : (
                      <video
                        src={exerciseMediaStreamPath(
                          "/api/admin/exercise-videos",
                          video.id,
                          item.id
                        )}
                        className="h-24 w-32 object-cover"
                        muted
                        playsInline
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleRemoveMedia(item.id)}
                      className={`absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white ${
                        removed
                          ? "bg-zinc-700 hover:bg-zinc-600"
                          : "bg-black/80 hover:bg-red-500/90"
                      }`}
                      aria-label={removed ? "Keep media" : "Remove media"}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {newMediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative overflow-hidden border border-zinc-800 bg-zinc-900"
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
                    onClick={() => removeNewMedia(file.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-white hover:bg-red-500/90"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <FilePicker
              accept="image/*,video/*"
              multiple
              disabled={saving || keptMediaCount >= MAX_EXERCISE_MEDIA_FILES}
              onFiles={onEditFilesSelect}
              className="flex h-10 w-full items-center justify-center gap-2 border border-zinc-700 bg-black px-4 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              Add Files ({keptMediaCount}/{MAX_EXERCISE_MEDIA_FILES})
            </FilePicker>
          </div>
        ) : (
          <ExerciseMediaGallery
            exerciseId={video.id}
            mediaItems={mediaItems}
            title={video.name}
            streamBasePath="/api/admin/exercise-videos"
          />
        )}
      </div>
      <div className="p-4 pt-0">
        {editing ? (
          <div className="space-y-3">
            <div>
              <FieldLabel>Exercise Title</FieldLabel>
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                disabled={saving}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") cancelEdit();
                }}
              />
            </div>
            <div>
              <FieldLabel>Tags (comma-separated)</FieldLabel>
              <Input
                placeholder="Legs, Push, Cardio"
                value={tagsDraft}
                onChange={(e) => setTagsDraft(e.target.value)}
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void saveDetails();
                  if (e.key === "Escape") cancelEdit();
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                className="h-9 bg-[#6B93B8] px-4 text-xs text-white hover:bg-[#5a82a7]"
                disabled={saving}
                onClick={() => void saveDetails()}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 border-zinc-700 px-4 text-xs text-zinc-300"
                disabled={saving}
                onClick={cancelEdit}
              >
                Cancel
              </Button>
            </div>
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold uppercase tracking-wide text-white">
                {video.name}
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
                aria-label={`Edit ${video.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            {mediaItems.length > 1 && (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {mediaItems.length} demos
              </p>
            )}
            {video.tags && video.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B93B8]"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-600">
                No tags
              </p>
            )}
          </>
        )}
      </div>
    </article>
  );
}
