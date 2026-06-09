import { ProgressClient } from "@/components/ProgressClient";
import {
  getAdminClientById,
  getProgressPhotos,
  getUserHeight,
  getWeightHistory,
} from "@/lib/data";
import { notFound } from "next/navigation";

export default async function AdminClientProgressPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getAdminClientById(clientId);
  if (!client) notFound();

  const [history, photos, height] = await Promise.all([
    getWeightHistory(clientId),
    getProgressPhotos(clientId),
    getUserHeight(clientId),
  ]);

  return (
    <ProgressClient
      readOnly
      userId={clientId}
      initialHistory={history}
      initialPhotos={photos}
      initialHeight={height}
    />
  );
}
