import { Readable } from "stream";
import { Db, GridFSBucket } from "mongodb";

const BUCKET_NAME = "progress_photo_files";
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

function parseBase64DataUrl(dataUrl: string): { buffer: Buffer; contentType: string } {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) throw new Error("Invalid photo data");
  const meta = dataUrl.slice(0, comma);
  const contentTypeMatch = meta.match(/^data:([^;]+)/);
  if (!contentTypeMatch) throw new Error("Invalid photo data");
  const buffer = Buffer.from(dataUrl.slice(comma + 1), "base64");
  return { buffer, contentType: contentTypeMatch[1] };
}

export async function saveProgressPhotoToGridFS(
  db: Db,
  fileId: string,
  dataUrl: string
): Promise<{ contentType: string; size: number }> {
  const { buffer, contentType } = parseBase64DataUrl(dataUrl);
  if (buffer.length > MAX_PHOTO_BYTES) {
    throw new Error("Photo must be under 8MB");
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

export async function openProgressPhotoStream(
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
      "image/jpeg",
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

export function progressPhotoStreamPath(photoId: string): string {
  return `/api/progress/photos/${photoId}/stream`;
}

export async function readProgressPhotoAsDataUrl(
  db: Db,
  fileId: string
): Promise<string | null> {
  const gridStream = await openProgressPhotoStream(db, fileId);
  if (!gridStream) return null;

  const chunks: Buffer[] = [];
  for await (const chunk of gridStream.stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  return `data:${gridStream.contentType};base64,${buffer.toString("base64")}`;
}
