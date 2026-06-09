export type ExerciseMediaDisplay = {
  id: string;
  type: "image" | "video";
  video_url?: string;
  has_uploaded_file?: boolean;
};

export type ExerciseMediaStored = {
  id: string;
  type: "image" | "video";
  video_url?: string;
  file_id?: string;
  content_type?: string;
};

export function mediaTypeFromDataUrl(dataUrl: string): "image" | "video" {
  if (dataUrl.startsWith("data:image/")) return "image";
  return "video";
}

export function resolveExerciseMediaItems(doc: {
  id?: string;
  media_items?: ExerciseMediaStored[];
  video_url?: string;
  video_file_id?: string;
  video_base64?: string;
}): ExerciseMediaDisplay[] {
  if (Array.isArray(doc.media_items) && doc.media_items.length > 0) {
    return doc.media_items.map((item) => ({
      id: String(item.id),
      type: item.type === "image" ? "image" : "video",
      video_url: item.video_url ? String(item.video_url) : undefined,
      has_uploaded_file: Boolean(item.file_id),
    }));
  }

  if (doc.video_url || doc.video_file_id || doc.video_base64) {
    return [
      {
        id: "legacy",
        type: "video",
        video_url: doc.video_url ? String(doc.video_url) : undefined,
        has_uploaded_file: Boolean(doc.video_file_id || doc.video_base64),
      },
    ];
  }

  return [];
}

export function getExerciseMediaStreamTarget(
  doc: Record<string, unknown>,
  mediaId: string
): { fileId: string; fallbackBase64?: string } | null {
  const items = doc.media_items as ExerciseMediaStored[] | undefined;
  if (Array.isArray(items) && items.length > 0) {
    const item = items.find((entry) => String(entry.id) === mediaId);
    if (!item?.file_id) return null;
    return { fileId: String(item.file_id) };
  }

  if (mediaId === "legacy" && (doc.video_file_id || doc.video_base64)) {
    return {
      fileId: String(doc.video_file_id ?? doc.id),
      fallbackBase64: doc.video_base64 ? String(doc.video_base64) : undefined,
    };
  }

  return null;
}

export function exerciseMediaStreamPath(
  basePath: string,
  exerciseId: string,
  mediaId: string
): string {
  return `${basePath}/${exerciseId}/media/${mediaId}/stream`;
}
