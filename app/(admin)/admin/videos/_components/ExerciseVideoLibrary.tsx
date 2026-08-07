"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Link2, Pencil, Tag, Trash2, Upload, Video, X } from "lucide-react";
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
import {
  EXERCISE_CATALOG_TYPES,
  EXERCISE_CATALOG_TYPE_LABELS,
  formatExerciseCatalogType,
  resolveExerciseCatalogType,
  type ExerciseCatalogType,
} from "@/lib/exercise-catalog-types";
import { readFileAsDataUrl, readImageDataUrl } from "@/lib/file-upload";
import { cn } from "@/lib/utils";

const adminSelectClass =
  "h-11 w-full border border-zinc-700 bg-black px-3 text-sm text-white focus:border-zinc-500 focus:outline-none";

function ExerciseTypeSelect({
  value,
  onChange,
  disabled,
  required,
  id,
}: {
  value: string;
  onChange: (value: ExerciseCatalogType | "") => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) =>
        onChange(event.target.value as ExerciseCatalogType | "")
      }
      disabled={disabled}
      required={required}
      className={adminSelectClass}
    >
      <option value="">Select type…</option>
      {EXERCISE_CATALOG_TYPES.map((type) => (
        <option key={type} value={type}>
          {EXERCISE_CATALOG_TYPE_LABELS[type]}
        </option>
      ))}
    </select>
  );
}

type ExerciseMediaSource = "url" | "upload";

function ExerciseMediaSourceToggle({
  value,
  onChange,
  disabled,
}: {
  value: ExerciseMediaSource;
  onChange: (value: ExerciseMediaSource) => void;
  disabled?: boolean;
}) {
  const options: Array<{
    id: ExerciseMediaSource;
    label: string;
    icon: typeof Link2;
  }> = [
    { id: "url", label: "Video URL", icon: Link2 },
    { id: "upload", label: "Upload File", icon: Upload },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "inline-flex h-10 items-center gap-2 border px-4 text-xs font-semibold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              active
                ? "border-[#6B93B8] bg-[#6B93B8]/15 text-white"
                : "border-zinc-700 bg-black text-zinc-400 hover:border-zinc-500 hover:text-white"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function inferMediaSource(
  video: ExerciseVideo,
  mediaItems: ReturnType<typeof resolveExerciseMediaItems>
): ExerciseMediaSource {
  const hasUploadedMedia = mediaItems.some((item) => item.has_uploaded_file);
  if (hasUploadedMedia) return "upload";
  if (primaryVideoUrl(video)) return "url";
  return "url";
}

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

function primaryVideoUrl(video: ExerciseVideo): string {
  if (video.video_url?.trim()) return video.video_url.trim();
  const urlItem = video.media_items?.find((item) => item.video_url?.trim());
  return urlItem?.video_url?.trim() ?? "";
}

export function ExerciseVideoLibrary({ videos }: { videos: ExerciseVideo[] }) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [items, setItems] = useState(videos);
  const [name, setName] = useState("");
  const [exerciseType, setExerciseType] = useState<ExerciseCatalogType | "">("");
  const [mediaSource, setMediaSource] = useState<ExerciseMediaSource>("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaFiles, setMediaFiles] = useState<PendingMedia[]>([]);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setItems(videos);
  }, [videos]);

  function removeCachedVideo(videoId: string) {
    setItems((current) => current.filter((video) => video.id !== videoId));
    void mutate(
      adminVideosKey(),
      (current?: AdminVideosPageData) =>
        current
          ? { videos: current.videos.filter((video) => video.id !== videoId) }
          : current,
      { revalidate: false }
    );
  }

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

  function changeMediaSource(next: ExerciseMediaSource) {
    setMediaSource(next);
    setError("");
    if (next === "url") {
      setMediaFiles([]);
    } else {
      setVideoUrl("");
    }
  }

  async function uploadVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!exerciseType) {
      setError("Exercise type is required");
      return;
    }

    const trimmedUrl = videoUrl.trim();
    if (mediaSource === "url") {
      if (!trimmedUrl) {
        setError("Video URL is required");
        return;
      }
      try {
        new URL(trimmedUrl);
      } catch {
        setError("Invalid video URL");
        return;
      }
    } else if (mediaFiles.length === 0) {
      setError("Please choose at least one file");
      return;
    }

    setError("");
    setAdding(true);
    try {
      await api("admin/exercise-videos", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          type: exerciseType,
          ...(mediaSource === "url"
            ? { video_url: trimmedUrl }
            : {
                media_files: mediaFiles.map((file) => ({
                  data_base64: file.previewUrl,
                })),
              }),
        }),
      });
      setName("");
      setExerciseType("");
      setMediaSource("url");
      setVideoUrl("");
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
              <FieldLabel>Exercise Type</FieldLabel>
              <ExerciseTypeSelect
                value={exerciseType}
                onChange={setExerciseType}
                disabled={adding}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <FieldLabel>Demo Source</FieldLabel>
            <ExerciseMediaSourceToggle
              value={mediaSource}
              onChange={changeMediaSource}
              disabled={adding}
            />

            {mediaSource === "url" ? (
              <div>
                <FieldLabel>Video URL</FieldLabel>
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  disabled={adding}
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-600">
                  Paste a YouTube or direct video link.
                </p>
              </div>
            ) : (
              <div>
                <FieldLabel>Photos &amp; Videos</FieldLabel>
                <FilePicker
                  accept="image/*,video/*"
                  multiple
                  disabled={adding || mediaFiles.length >= MAX_EXERCISE_MEDIA_FILES}
                  onFiles={onFilesSelect}
                  className="flex h-12 w-full items-center justify-center gap-2 border border-zinc-700 bg-black px-4 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  Choose Files ({mediaFiles.length}/{MAX_EXERCISE_MEDIA_FILES})
                </FilePicker>
                <p className="mt-1 text-[10px] text-zinc-600">
                  Upload up to {MAX_EXERCISE_MEDIA_FILES} images or videos from
                  your device.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-12 gap-2 bg-[#6B93B8] px-8 text-white hover:bg-[#5a82a7]"
              disabled={adding || !name.trim() || !exerciseType}
            >
              <Upload className="h-4 w-4" />
              {adding ? "Adding…" : "Add"}
            </Button>
          </div>

          {mediaSource === "upload" && mediaFiles.length > 0 && (
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
                onDeleted={() => removeCachedVideo(v.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExerciseVideoCard({
  video,
  mediaItems,
  onUpdated,
  onDeleted,
}: {
  video: ExerciseVideo;
  mediaItems: ReturnType<typeof resolveExerciseMediaItems>;
  onUpdated: (patch: Partial<ExerciseVideo>) => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(video.name);
  const [typeDraft, setTypeDraft] = useState<ExerciseCatalogType | "">(() =>
    resolveExerciseCatalogType(video)
  );
  const [videoUrlDraft, setVideoUrlDraft] = useState(() => primaryVideoUrl(video));
  const [mediaSourceDraft, setMediaSourceDraft] = useState<ExerciseMediaSource>(() =>
    inferMediaSource(video, mediaItems)
  );
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<PendingMedia[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const keptMediaCount =
    mediaItems.filter((item) => !removedMediaIds.includes(item.id)).length +
    newMediaFiles.length;

  useEffect(() => {
    if (!editing) {
      setNameDraft(video.name);
      setTypeDraft(resolveExerciseCatalogType(video));
      setVideoUrlDraft(primaryVideoUrl(video));
      setMediaSourceDraft(inferMediaSource(video, mediaItems));
      setRemovedMediaIds([]);
      setNewMediaFiles([]);
    }
  }, [video.name, video.type, video.tags, video.video_url, video.media_items, video.id, editing]);

  function cancelEdit() {
    setNameDraft(video.name);
    setTypeDraft(resolveExerciseCatalogType(video));
    setVideoUrlDraft(primaryVideoUrl(video));
    setMediaSourceDraft(inferMediaSource(video, mediaItems));
    setRemovedMediaIds([]);
    setNewMediaFiles([]);
    setEditing(false);
    setError("");
  }

  function changeMediaSourceDraft(next: ExerciseMediaSource) {
    setMediaSourceDraft(next);
    setError("");
    if (next === "url") {
      setNewMediaFiles([]);
    } else {
      setVideoUrlDraft("");
    }
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

  async function deleteExercise() {
    if (
      !window.confirm(
        `Delete "${video.name}"? This cannot be undone and removes the exercise from the library.`
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");
    try {
      await api(`admin/exercise-videos/${video.id}`, { method: "DELETE" });
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function saveDetails() {
    const trimmedName = nameDraft.trim();
    const hasMediaChanges =
      removedMediaIds.length > 0 || newMediaFiles.length > 0;
    const initialSource = inferMediaSource(video, mediaItems);
    const trimmedUrl = videoUrlDraft.trim();
    const metadataChanged =
      trimmedName !== video.name ||
      typeDraft !== resolveExerciseCatalogType(video) ||
      mediaSourceDraft !== initialSource ||
      (mediaSourceDraft === "url" && trimmedUrl !== primaryVideoUrl(video));

    if (!trimmedName) {
      setError("Exercise title is required");
      return;
    }
    if (!typeDraft) {
      setError("Exercise type is required");
      return;
    }
    if (mediaSourceDraft === "url") {
      if (!trimmedUrl) {
        setError("Video URL is required");
        return;
      }
      try {
        new URL(trimmedUrl);
      } catch {
        setError("Invalid video URL");
        return;
      }
    } else if (hasMediaChanges && keptMediaCount === 0) {
      setError("At least one image or video is required");
      return;
    }
    if (!metadataChanged && !hasMediaChanges) {
      cancelEdit();
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await api<ExerciseVideo>(`admin/exercise-videos/${video.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: trimmedName,
          type: typeDraft,
          ...(mediaSourceDraft === "url"
            ? { video_url: trimmedUrl }
            : { video_url: "" }),
          ...(mediaSourceDraft === "upload" && removedMediaIds.length > 0
            ? { remove_media_ids: removedMediaIds }
            : {}),
          ...(mediaSourceDraft === "upload" && newMediaFiles.length > 0
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
        type: updated.type,
        tags: updated.tags,
        video_url: updated.video_url,
        media_items: updated.media_items,
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
            {mediaSourceDraft === "upload" ? (
              <>
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
              </>
            ) : null}
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
              <FieldLabel>Exercise Type</FieldLabel>
              <ExerciseTypeSelect
                value={typeDraft}
                onChange={setTypeDraft}
                disabled={saving}
              />
            </div>
            <div className="space-y-3">
              <FieldLabel>Demo Source</FieldLabel>
              <ExerciseMediaSourceToggle
                value={mediaSourceDraft}
                onChange={changeMediaSourceDraft}
                disabled={saving}
              />
              {mediaSourceDraft === "url" ? (
                <div>
                  <FieldLabel>Video URL</FieldLabel>
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrlDraft}
                    onChange={(event) => setVideoUrlDraft(event.target.value)}
                    disabled={saving}
                  />
                </div>
              ) : null}
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
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  disabled={deleting}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-50"
                  aria-label={`Edit ${video.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void deleteExercise()}
                  disabled={deleting}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-red-900 hover:bg-red-950/40 hover:text-red-400 disabled:opacity-50"
                  aria-label={`Delete ${video.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {mediaItems.length > 1 && (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {mediaItems.length} demos
              </p>
            )}
            {(() => {
              const displayType = resolveExerciseCatalogType(video);
              return displayType ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B93B8]">
                    <Tag className="h-3 w-3" />
                    {formatExerciseCatalogType(displayType)}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-600">
                  No type
                </p>
              );
            })()}
            {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
          </>
        )}
      </div>
    </article>
  );
}
