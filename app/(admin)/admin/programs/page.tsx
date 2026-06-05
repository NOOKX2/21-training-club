import { ProgramBuilder } from "@/components/admin/ProgramBuilder";
import { getExerciseVideos, getProgramTemplate } from "@/lib/data";

const TRACKS = ["Fat Loss", "Muscle Gain", "Maintenance"];

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string; day?: string }>;
}) {
  const params = await searchParams;
  const track =
    params.track && TRACKS.includes(params.track) ? params.track : "Fat Loss";
  const day = Math.min(7, Math.max(1, parseInt(params.day ?? "1", 10) || 1));
  const [program, videos] = await Promise.all([
    getProgramTemplate(track, day),
    getExerciseVideos(),
  ]);
  return (
    <ProgramBuilder
      key={`${track}-${day}`}
      track={track}
      day={day}
      program={program}
      videos={videos}
    />
  );
}
