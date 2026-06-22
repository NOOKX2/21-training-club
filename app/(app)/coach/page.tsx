import { Suspense } from "react";
import { CoachPageView } from "@/components/app-pages/CoachPageView";

export default function CoachPage() {
  return (
    <Suspense fallback={null}>
      <CoachPageView />
    </Suspense>
  );
}
