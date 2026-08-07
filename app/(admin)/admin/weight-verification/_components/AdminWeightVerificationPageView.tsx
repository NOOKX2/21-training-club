"use client";

import { WeightVerification } from "@/app/(admin)/admin/weight-verification/_components/WeightVerification";
import { useAdminWeightVerificationPage } from "@/lib/hooks/use-admin-page";

export function AdminWeightVerificationPageView() {
  const { data } = useAdminWeightVerificationPage();
  if (!data) return null;
  return <WeightVerification lifts={data.lifts} />;
}
