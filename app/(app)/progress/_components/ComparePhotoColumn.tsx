"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { formatPhotoDate, photoSelectLabel } from "@/app/(app)/progress/_components/progress-utils";
import { clientField } from "@/lib/client-ui";
import type { ProgressPhoto } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ComparePhotoColumn({
  photos,
  selectedId,
  onSelect,
  label,
}: {
  photos: ProgressPhoto[];
  selectedId: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  const { t } = useLanguage();
  const photo = photos.find((p) => p.id === selectedId);
  if (!photo) return null;

  const src = photo.photo_base64 ?? photo.photo_url ?? "";

  return (
    <div className="min-w-0 space-y-2 sm:space-y-3">
      <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 sm:text-[10px] sm:tracking-[0.18em]">
        {label}
      </span>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className={cn(
          "w-full min-w-0 px-1.5 py-2 text-[10px] text-white focus:outline-none sm:px-3 sm:py-2.5 sm:text-sm",
          clientField
        )}
      >
        {photos.map((p) => (
          <option key={p.id} value={p.id}>
            {photoSelectLabel(p)}
          </option>
        ))}
      </select>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          className="aspect-square w-full rounded-lg object-cover sm:rounded-xl"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-zinc-900 text-[10px] text-zinc-600 sm:rounded-xl sm:text-sm">
          {t("progress.noPhoto")}
        </div>
      )}
      <div className="text-[11px] sm:text-sm">
        <p className="text-white">{formatPhotoDate(photo.date)}</p>
        <p className="mt-0.5 text-zinc-400 sm:mt-1">
          {photo.weight != null
            ? `${photo.weight} ${t("common.kg")}`
            : t("progress.weightNotRecorded")}
        </p>
        {photo.notes ? (
          <p className="mt-0.5 line-clamp-2 text-[10px] text-zinc-500 sm:mt-1 sm:text-xs">
            {photo.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}
