"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import type { ExerciseVideo } from "@/lib/data";

export function ExerciseVideoLibrary({ videos }: { videos: ExerciseVideo[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [adding, setAdding] = useState(false);

  async function addVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await api("admin/exercise-videos", {
        method: "POST",
        body: JSON.stringify({ name, video_url: videoUrl }),
      });
      setName("");
      setVideoUrl("");
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-wide text-white">
          <Video className="h-6 w-6 text-[#a3e635]" />
          Exercise Video Library
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage demo videos for program exercises
        </p>
      </div>

      <form
        onSubmit={addVideo}
        className="grid gap-4 border border-zinc-800 p-6 sm:grid-cols-2"
      >
        <div>
          <FieldLabel>Video Name</FieldLabel>
          <Input
            placeholder="Barbell Squat Demo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <FieldLabel>Video URL</FieldLabel>
          <Input
            placeholder="https://..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="gap-2 bg-[#a3e635] text-black sm:col-span-2"
          disabled={adding}
        >
          <Plus className="h-4 w-4" />
          Add Video
        </Button>
      </form>

      <div className="border border-zinc-800">
        {videos.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">
            No exercise videos yet
          </p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {videos.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-white">{v.name}</p>
                  {v.video_url && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {v.video_url}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
