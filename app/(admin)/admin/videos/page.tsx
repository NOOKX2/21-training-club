import { ExerciseVideoLibrary } from "@/components/admin/ExerciseVideoLibrary";
import { getExerciseVideos } from "@/lib/data";

export default async function AdminVideosPage() {
  const videos = await getExerciseVideos();
  return <ExerciseVideoLibrary videos={videos} />;
}
