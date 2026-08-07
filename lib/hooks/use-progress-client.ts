"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { ProgressJourneyStats, ProgressPhoto, WeightEntry } from "@/lib/data";
import { readImageDataUrl } from "@/lib/file-upload";

export function useProgressClient({
  userId,
  initialHistory,
  initialPhotos,
  initialHeight,
  t,
}: {
  userId: string;
  initialHistory: WeightEntry[];
  initialPhotos: ProgressPhoto[];
  initialHeight: number | null;
  t: (key: string) => string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const last = initialHistory[initialHistory.length - 1];

  const [weight, setWeight] = useState(last ? String(last.weight) : "85");
  const [height, setHeight] = useState(
    initialHeight != null
      ? String(initialHeight)
      : last?.height
        ? String(last.height)
        : "180"
  );
  const [photoWeight, setPhotoWeight] = useState(last ? String(last.weight) : "85");
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [history, setHistory] = useState(initialHistory);
  const [photos, setPhotos] = useState(initialPhotos);
  const [beforePhotoId, setBeforePhotoId] = useState("");
  const [afterPhotoId, setAfterPhotoId] = useState("");
  const [journeyStats, setJourneyStats] = useState<ProgressJourneyStats | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);

  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  useEffect(() => {
    if (!photos.length) {
      setBeforePhotoId("");
      setAfterPhotoId("");
      return;
    }
    setBeforePhotoId((current) =>
      photos.some((p) => p.id === current) ? current : photos[0].id
    );
    setAfterPhotoId((current) =>
      photos.some((p) => p.id === current) ? current : photos[photos.length - 1].id
    );
  }, [photos]);

  useEffect(() => {
    const before = photos.find((photo) => photo.id === beforePhotoId);
    const after = photos.find((photo) => photo.id === afterPhotoId);
    if (!before?.date || !after?.date) {
      setJourneyStats(null);
      return;
    }

    const start = before.date.slice(0, 10);
    const end = after.date.slice(0, 10);
    let cancelled = false;
    setJourneyLoading(true);

    const journeyParams = new URLSearchParams({ start, end, user_id: userId });
    void api<ProgressJourneyStats>(`progress/journey?${journeyParams.toString()}`)
      .then((stats) => {
        if (!cancelled) setJourneyStats(stats);
      })
      .catch(() => {
        if (!cancelled) setJourneyStats(null);
      })
      .finally(() => {
        if (!cancelled) setJourneyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [beforePhotoId, afterPhotoId, photos, userId]);

  async function logWeight() {
    setMessage("");
    setError("");
    try {
      const entry = await api<WeightEntry & { id?: string }>("weight-tracking", {
        method: "POST",
        body: JSON.stringify({
          weight: Number(weight),
          height: height ? Number(height) : undefined,
        }),
      });
      setHistory((prev) => [
        ...prev,
        {
          weight: Number(entry.weight),
          height: entry.height,
          date: entry.date ?? new Date().toISOString(),
        },
      ]);
      setMessage(t("progress.weightSaved"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.saveFailed"));
    }
  }

  async function submitPhoto(dataUrl: string) {
    const doc = await api<ProgressPhoto & { photo_url?: string }>("progress/photo", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        photo_base64: dataUrl,
        weight: photoWeight ? Number(photoWeight) : undefined,
        notes,
      }),
    });
    setPhotos((prev) => [
      ...prev,
      {
        id: doc.id,
        photo_base64: dataUrl,
        weight: doc.weight,
        notes: doc.notes,
        date: doc.date ?? new Date().toISOString(),
      },
    ]);
    setAfterPhotoId(doc.id);
    if (photos.length === 0) setBeforePhotoId(doc.id);
    setPhotoMessage(t("progress.photoSaved"));
    setPhotoPreview("");
    setNotes("");
    router.refresh();
  }

  async function onPhotoSelect(file: File | null) {
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoMessage("");
    setPhotoError("");
    try {
      const dataUrl = await readImageDataUrl(file);
      setPhotoPreview(dataUrl);
      await submitPhoto(dataUrl);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : t("common.uploadFailed"));
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function openPhotoPicker() {
    fileInputRef.current?.click();
  }

  const currentWeight = Number(weight) || 0;
  const currentHeight = Number(height) || 0;
  const startWeight = history[0]?.weight ?? currentWeight;
  const changeKg = currentWeight - startWeight;
  const changePercent = startWeight > 0 ? (changeKg / startWeight) * 100 : 0;
  const bmi =
    currentWeight > 0 && currentHeight > 0
      ? currentWeight / Math.pow(currentHeight / 100, 2)
      : null;

  let avgPerTime: number | null = null;
  if (history.length >= 2) {
    let totalDelta = 0;
    for (let i = 1; i < history.length; i++) {
      totalDelta += Number(history[i].weight) - Number(history[i - 1].weight);
    }
    avgPerTime = totalDelta / (history.length - 1);
  }

  return {
    fileInputRef,
    weight,
    setWeight,
    height,
    setHeight,
    photoWeight,
    setPhotoWeight,
    notes,
    setNotes,
    photoPreview,
    uploadingPhoto,
    message,
    photoMessage,
    error,
    photoError,
    history,
    photos,
    beforePhotoId,
    setBeforePhotoId,
    afterPhotoId,
    setAfterPhotoId,
    journeyStats,
    journeyLoading,
    logWeight,
    onPhotoSelect,
    openPhotoPicker,
    hasPhotos: photos.length > 0,
    hasWeightHistory: history.length > 0,
    changeKg,
    changePercent,
    bmi,
    avgPerTime,
    last,
  };
}
