import { FormCheckQueue } from "@/components/admin/FormCheckQueue";
import { getPendingFormChecks } from "@/lib/data";

export default async function AdminFormChecksPage() {
  const submissions = await getPendingFormChecks();
  return <FormCheckQueue submissions={submissions} />;
}
