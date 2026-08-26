import { Suspense } from "react";
import { CoachPageView } from "@/app/(app)/coach/_components/CoachPageView";

export default function CoachPage() {
  return (
    <Suspense fallback={null}>
      <CoachPageView />
    </Suspense>
  );
}
