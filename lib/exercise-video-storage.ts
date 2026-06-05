import { Readable } from "stream";
import { Db, GridFSBucket } from "mongodb";
import { MAX_VIDEO_BYTES, MAX_VIDEO_MB } from "./exercise-video-constants";

const BUCKET_NAME = "exercise_video_files";

function parseBase64DataUrl(dataUrl: string): { buffer: Buffer; contentType: string } {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) throw new Error("Invalid video data");
  const meta = dataUrl.slice(0, comma);
  const contentTypeMatch = meta.match(/^data:([^;]+)/);
  if (!contentTypeMatch) throw new Error("Invalid video data");
  const buffer = Buffer.from(dataUrl.slice(comma + 1), "base64");
  return { buffer, contentType: contentTypeMatch[1] };
}

export async function saveExerciseVideoToGridFS(
  db: Db,
  fileId: string,
  dataUrl: string
): Promise<{ contentType: string; size: number }> {
  const { buffer, contentType } = parseBase64DataUrl(dataUrl);
  if (buffer.length > MAX_VIDEO_BYTES) {
    throw new Error(`Video must be under ${MAX_VIDEO_MB}MB`);
  }

  const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(fileId, {
      metadata: { contentType },
    });
    uploadStream.on("finish", () => resolve({ contentType, size: buffer.length }));
    uploadStream.on("error", reject);
    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function openExerciseVideoStream(
  db: Db,
  fileId: string
): Promise<{ stream: NodeJS.ReadableStream; contentType: string } | null> {
  const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
  const files = await bucket.find({ filename: fileId }).limit(1).toArray();
  if (!files.length) return null;
  return {
    stream: bucket.openDownloadStreamByName(fileId),
    contentType:
      (files[0].metadata as { contentType?: string } | undefined)?.contentType ??
      "video/mp4",
  };
}

export function streamFromBase64DataUrl(
  dataUrl: string
): { body: Buffer; contentType: string } | null {
  try {
    const { buffer, contentType } = parseBase64DataUrl(dataUrl);
    return { body: buffer, contentType };
  } catch {
    return null;
  }
}
