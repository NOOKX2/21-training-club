"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChatComposer, ChatMessageList } from "@/components/chat/ChatUI";
import {
  ExerciseProgramPickerModal,
  type ProgramShareDraft,
} from "@/components/coach/ExerciseProgramPickerModal";
import { CoachWeeklyReportsModal } from "@/components/CoachWeeklyReportsModal";
import {
  buildProgramSharePayload,
  formatProgramShareMessage,
} from "@/lib/format-program-share";
import { markChatNotificationsRead } from "@/components/NotificationBell";
import { useLanguage } from "@/components/LanguageProvider";
import { api } from "@/lib/api-client";
import { clientCard } from "@/lib/client-ui";
import type { Coach, Message, WeeklyReport } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CoachClient({
  userId,
  coaches,
  coachId,
  initialMessages,
  initialReports,
  programStartDate,
}: {
  userId: string;
  coaches: Coach[];
  coachId: string;
  initialMessages: Message[];
  initialReports: WeeklyReport[];
  programStartDate: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState("");
  const [reportsOpen, setReportsOpen] = useState(false);
  const [programPickerOpen, setProgramPickerOpen] = useState(false);
  const [programDraft, setProgramDraft] = useState<ProgramShareDraft | null>(null);
  const [reports, setReports] = useState(initialReports);
  const [sending, setSending] = useState(false);

  const coach = coaches.find((c) => c.id === coachId);
  const coachName = coach?.name ?? "Coach";
  const messages = initialMessages;
  const initials = coachName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const reportCount = reports.length;

  useEffect(() => {
    markChatNotificationsRead({ isAdmin: false }).catch(() => {});
  }, [coachId]);

  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  function buildOutgoingMessage() {
    if (programDraft) {
      return formatProgramShareMessage({
        week: programDraft.week,
        day: programDraft.day,
        exercises: programDraft.exercises,
        cardio: programDraft.cardio,
        question: content.trim() || undefined,
      });
    }
    return content.trim() || "[Attachment]";
  }

  async function send() {
    const outgoing = buildOutgoingMessage();
    if ((!outgoing || outgoing === "[Attachment]") && !attachment) return;
    if (!coachId || sending) return;
    setSending(true);
    try {
      const programShare = programDraft
        ? buildProgramSharePayload({
            week: programDraft.week,
            day: programDraft.day,
            exercises: programDraft.exercises,
            cardio: programDraft.cardio,
            question: content.trim() || undefined,
          })
        : undefined;

      await api("messages", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          coach_id: coachId,
          sender: "user",
          content: outgoing,
          attachment_base64: attachment,
          program_share: programShare,
        }),
      });
      setContent("");
      setAttachment("");
      setProgramDraft(null);
      router.refresh();
    } finally {
      setSending(false);
    }
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
        "-mx-4 flex flex-col overflow-hidden rounded-none sm:mx-0 sm:rounded-[20px]",
        "h-[calc(100dvh-84px-5.5rem-env(safe-area-inset-bottom,0px))]",
        "lg:h-[calc(100vh-9.5rem)]"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
          {coach?.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coach.profile_image_url}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/10 sm:h-12 sm:w-12"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6B93B8] text-xs font-bold text-white sm:h-12 sm:w-12 sm:text-sm">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white sm:text-base">{coachName}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6B93B8] sm:text-xs">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-[#6B93B8]" />
              {t("common.online")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="relative h-9 w-9 px-0 sm:w-auto sm:px-3 sm:text-[10px]"
            onClick={() => setReportsOpen(true)}
            aria-label={t("coach.reportFromCoach")}
            title={t("coach.reportFromCoach")}
          >
            <FileText className="h-4 w-4 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">{t("coach.reportFromCoach")}</span>
            {reportCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B93B8] px-1 text-[9px] font-bold text-white">
                {reportCount > 9 ? "9+" : reportCount}
              </span>
            ) : null}
          </Button>
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
        emptyHint={t("coach.emptyHint")}
      />

      {programDraft && (
        <div className="shrink-0 border-t border-white/10 px-3 py-2 sm:px-5">
          <div className="flex items-center gap-3 rounded-xl border border-[#6B93B8]/30 bg-[#6B93B8]/10 p-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#6B93B8]/20 text-[#6B93B8] sm:h-14 sm:w-14">
              <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white">{t("coach.programAttached")}</p>
              <p className="text-[10px] text-white/45">
                {t("common.week")} {programDraft.week} · {t("common.day")} {programDraft.day} ·{" "}
                {programDraft.exercises.length} {t("coach.exercisesSelected")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setProgramDraft(null)}
              className="text-xs text-white/45 hover:text-white"
            >
              {t("common.remove")}
            </button>
          </div>
        </div>
      )}

      {attachment && (
        <div className="shrink-0 border-t border-white/10 px-3 py-2 sm:px-5">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={attachment} alt="Preview" className="h-12 w-12 rounded-lg object-cover sm:h-14 sm:w-14" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white">{t("coach.imageAttached")}</p>
              <p className="text-[10px] text-white/45">{t("coach.readyToSend")}</p>
            </div>
            <button
              type="button"
              onClick={() => setAttachment("")}
              className="text-xs text-white/45 hover:text-white"
            >
              {t("common.remove")}
            </button>
          </div>
        </div>
      )}

      <ExerciseProgramPickerModal
        open={programPickerOpen}
        onClose={() => setProgramPickerOpen(false)}
        programStartDate={programStartDate}
        onConfirm={setProgramDraft}
      />

      <ChatComposer
        variant="coach"
        content={content}
        onContentChange={setContent}
        onSend={send}
        onAttach={onAttach}
        onPickProgram={() => setProgramPickerOpen(true)}
        pickProgramLabel={t("coach.pickProgram")}
        canSend={Boolean(content.trim() || attachment || programDraft) && !sending}
        sendLabel={sending ? t("common.sending") : t("common.send")}
        placeholder={t("coach.messagePlaceholder")}
      />
    </div>
  );
}
