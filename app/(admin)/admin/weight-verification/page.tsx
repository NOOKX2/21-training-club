import { WeightVerification } from "@/components/admin/WeightVerification";
import { getPendingLifts } from "@/lib/data";

export default async function AdminWeightVerificationPage() {
  const lifts = await getPendingLifts();
  return <WeightVerification lifts={lifts} />;
}
