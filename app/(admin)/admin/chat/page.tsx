import { Suspense } from "react";
import { AdminChatPageView } from "@/app/(admin)/admin/chat/_components/AdminChatPageView";

export default function AdminChatPage() {
  return (
    <Suspense fallback={null}>
      <AdminChatPageView />
    </Suspense>
  );
}
