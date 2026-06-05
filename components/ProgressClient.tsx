"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Scale, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import type { ProgressPhoto, WeightEntry } from "@/lib/data";

export function ProgressClient({
  userId,
  initialHistory,
  initialPhotos,
  initialHeight,
}: {
  userId: string;
  initialHistory: WeightEntry[];
  initialPhotos: ProgressPhoto[];
  initialHeight: number | null;
}) {
  const router = useRouter();
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
  const [photoFile, setPhotoFile] = useState("");

  const history = initialHistory;
  const photos = initialPhotos;

  async function logWeight() {
    await api("weight-tracking", {
      method: "POST",
      body: JSON.stringify({
        weight: Number(weight),
        height: height ? Number(height) : undefined,
      }),
    });
    router.refresh();
  }

  function onPhotoSelect(f: File | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoFile(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function uploadPhoto() {
    if (!photoFile) return;
    await api("progress/photo", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        photo_base64: photoFile,
        weight: photoWeight ? Number(photoWeight) : undefined,
        notes,
      }),
    });
    setPhotoFile("");
    setNotes("");
    router.refresh();
  }

  const hasWeightHistory = history.length > 0;
  const hasEnoughPhotos = photos.length >= 2;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold uppercase tracking-tight text-white">
        Progress Tracker
      </h1>

      <section className="border border-zinc-800 p-6">
        <h2 className="text-lg font-bold uppercase tracking-wide text-white">
          Weight Tracker
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Today&apos;s Weight (kg)</FieldLabel>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Height (cm)</FieldLabel>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          className="mt-5 h-12 w-full text-sm"
          onClick={logWeight}
        >
          Log Weight
        </Button>

        {!hasWeightHistory ? (
          <div className="mt-10 flex flex-col items-center py-12 text-zinc-500">
            <Scale className="mb-4 h-12 w-12 stroke-1" />
            <p className="text-sm">
              Start tracking your weight to see progress
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-2 text-sm text-zinc-400">
            {history.slice(-5).map((e, i) => (
              <p key={i}>
                {String(e.date).slice(0, 10)} — {e.weight} kg
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="border border-zinc-800 p-6">
        <h2 className="text-lg font-bold uppercase tracking-wide text-white">
          Upload Progress Photo
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Current Weight (kg)</FieldLabel>
            <Input
              type="number"
              value={photoWeight}
              onChange={(e) => setPhotoWeight(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Notes</FieldLabel>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Feeling strong today!"
            />
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="mt-4 w-full text-sm text-zinc-500"
          onChange={(e) => onPhotoSelect(e.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 text-sm"
          onClick={uploadPhoto}
          disabled={!photoFile}
        >
          <Camera className="h-4 w-4" />
          Take/Upload Photo
        </Button>
      </section>

      <section className="border border-zinc-800 p-6">
        {!hasEnoughPhotos ? (
          <div className="flex flex-col items-center py-12 text-center">
            <TrendingUp className="mb-4 h-12 w-12 text-zinc-600" />
            <p className="font-medium text-white">
              Start tracking your transformation
            </p>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              Upload at least 2 photos to see your before &amp; after comparison
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {photos.slice(0, 2).map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.photo_base64}
                alt="Progress"
                className="aspect-square w-full object-cover"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
