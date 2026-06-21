/** MIME types browsers cannot render in a plain <img src="data:..."> */
const NON_DISPLAYABLE_DATA_IMAGE_TYPES = /^data:image\/(heic|heif)\b/i;

export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  return /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name);
}

export function isBrowserDisplayableImageDataUrl(src?: string | null): boolean {
  if (!src) return false;
  if (NON_DISPLAYABLE_DATA_IMAGE_TYPES.test(src)) return false;
  return (
    src.startsWith("data:image/") ||
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  );
}

export function browserDisplayableImageSrc(src?: string | null): string | null {
  if (!src || !isBrowserDisplayableImageDataUrl(src)) return null;
  return src;
}
