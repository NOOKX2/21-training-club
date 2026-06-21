import { ProgressClient } from "@/components/ProgressClient";
import {
  getProgressPhotos,
  getUserHeight,
  getWeightHistory,
} from "@/lib/data";
import { requireAppUser } from "@/lib/session";

export default async function ProgressPage() {
  const user = await requireAppUser();
  const [history, photos, height] = await Promise.all([
    getWeightHistory(user.id),
    getProgressPhotos(user.id),
    getUserHeight(user.id),
  ]);
  return (
    <ProgressClient
      userId={user.id}
      initialHistory={history}
      initialPhotos={photos}
      initialHeight={height}
    />
  );
}
