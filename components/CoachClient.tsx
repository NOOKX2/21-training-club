"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ChatComposer, ChatMessageList } from "@/components/chat/ChatUI";
import { CoachWeeklyReportsModal } from "@/components/CoachWeeklyReportsModal";
import { markChatNotificationsRead } from "@/components/NotificationBell";
import { api } from "@/lib/api-client";
import { clientCard } from "@/lib/client-ui";
import type { Coach, Message, WeeklyReport } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CoachClient({
  userId,
  tierLevel,
  coaches,
  coachId,
  initialMessages,
  initialReports,
}: {
  userId: string;
  tierLevel: string;
  coaches: Coach[];
  coachId: string;
  initialMessages: Message[];
  initialReports: WeeklyReport[];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState("");
  const [reportsOpen, setReportsOpen] = useState(false);
  const [reports, setReports] = useState(initialReports);

  const coach = coaches.find((c) => c.id === coachId);
  const coachName = coach?.name ?? "Coach";
  const messages = initialMessages;
  const initials = coachName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    markChatNotificationsRead({ isAdmin: false }).catch(() => {});
  }, [coachId]);

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  async function send() {
    if ((!content.trim() && !attachment) || !coachId) return;
    await api("messages", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        coach_id: coachId,
        sender: "user",
        content: content.trim() || "[Attachment]",
        attachment_base64: attachment,
      }),
    });
    setContent("");
    setAttachment("");
    router.refresh();
  }

  function onAttach(f: File | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment(reader.result as string);
    reader.readAsDataURL(f);
  }

  return (
    <div
      className={cn(
        clientCard,
        "flex min-h-[calc(100vh-9.5rem)] flex-col overflow-hidden rounded-[20px]"
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3.5">
          {coach?.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coach.profile_image_url}
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6B93B8] text-sm font-bold text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="text-base font-bold text-white">{coachName}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#5BAD8F]">
              <span aria-hidden>●</span>
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3 text-[10px]"
            onClick={() => setReportsOpen(true)}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Report from Coach
          </Button>
          {tierLevel === "Tier 3" && (
            <Link href="/profile">
              <Button type="button" variant="outline" className="h-9 px-3 text-[10px]">
                <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
                Form Check
              </Button>
            </Link>
          )}
        </div>
      </div>

      <CoachWeeklyReportsModal
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        reports={reports}
      />

      <ChatMessageList
        variant="coach"
        messages={messages}
        isOwnMessage={(m) => m.sender === "user"}
        peerAvatarUrl={coach?.profile_image_url}
        peerLabel={coachName}
        peerInitials={initials}
        emptyHint="Send a message to your coach — they usually reply within a few hours."
      />

      {attachment && (
        <div className="border-t border-white/10 px-5 py-2">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={attachment} alt="Preview" className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white">Image attached</p>
              <p className="text-[10px] text-white/45">Ready to send</p>
            </div>
            <button
              type="button"
              onClick={() => setAttachment("")}
              className="text-xs text-white/45 hover:text-white"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <ChatComposer
        variant="coach"
        content={content}
        onContentChange={setContent}
        onSend={send}
        onAttach={onAttach}
        canSend={Boolean(content.trim() || attachment)}
        sendLabel="Send"
      />
    </div>
  );
}
