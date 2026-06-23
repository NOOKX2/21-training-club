"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { ChevronLeft, User } from "lucide-react";
import { ChatComposer, ChatMessageList } from "@/components/chat/ChatUI";
import { CoachProfileEditor } from "@/components/admin/CoachProfileEditor";
import { CoachWeeklyFeedbackForm } from "@/components/admin/CoachWeeklyFeedbackForm";
import { markChatNotificationsRead } from "@/components/NotificationBell";
import { api } from "@/lib/api-client";
import { adminChatMessagesKey } from "@/lib/admin-page-keys";
import type { AdminChatClient, Coach, Message } from "@/lib/data";
import { expiryCountdownLabel } from "./admin-utils";
import { cn } from "@/lib/utils";

export function AdminChat({
  clients,
  coaches,
  selectedClientId,
  messages: messagesProp,
  messagesLoading = false,
  onSelectClient,
}: {
  clients: AdminChatClient[];
  coaches: Coach[];
  selectedClientId: string;
  messages: Message[];
  messagesLoading?: boolean;
  onSelectClient: (clientId: string) => void;
}) {
  const { mutate } = useSWRConfig();
  const coach = coaches[0];
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState("");
  const [messages, setMessages] = useState(messagesProp);

  const selected = clients.find((c) => c.id === selectedClientId);
  const selectedDaysLeft = selected ? expiryCountdownLabel(selected) : null;

  useEffect(() => {
    setMessages(messagesProp);
  }, [messagesProp, selectedClientId]);

  useEffect(() => {
    if (!selectedClientId) return;
    markChatNotificationsRead({
      isAdmin: true,
      clientId: selectedClientId,
    }).catch(() => {});
  }, [selectedClientId]);

  async function send() {
    if ((!content.trim() && !attachment) || !selectedClientId || !coach) return;
    const result = await api<Message>("messages", {
      method: "POST",
      body: JSON.stringify({
        user_id: selectedClientId,
        coach_id: coach.id,
        sender: "coach",
        content: content.trim() || "[Attachment]",
        attachment_base64: attachment,
      }),
    });
    setContent("");
    setAttachment("");
    setMessages((current) => [...current, result]);
    void mutate(
      adminChatMessagesKey(selectedClientId),
      (current?: { clientId: string; messages: Message[] }) => ({
        clientId: selectedClientId,
        messages: [...(current?.messages ?? messages), result],
      }),
      { revalidate: false }
    );
  }

  function onAttach(f: File | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment(reader.result as string);
    reader.readAsDataURL(f);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="hidden text-xl font-bold uppercase tracking-wide text-white sm:block sm:text-2xl">
        Chat with Clients
      </h1>

      {coach ? <CoachProfileEditor coach={coach} /> : null}

      <div className="flex min-h-[calc(100dvh-7rem)] flex-col border border-zinc-800 lg:h-[calc(100vh-12rem)] lg:flex-row">
        <div
          className={cn(
            "w-full shrink-0 overflow-y-auto border-b border-zinc-800 bg-zinc-950 lg:w-72 lg:border-b-0 lg:border-r",
            selectedClientId ? "hidden lg:block" : "block"
          )}
        >
          <p className="border-b border-zinc-800 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white">
            Clients
          </p>
          {clients.map((c) => {
            const daysLeft = expiryCountdownLabel(c);
            return (
              <div
                key={c.id}
                className={cn(
                  "flex min-h-[56px] items-center gap-3 border-b border-zinc-800/50 px-4 py-3 transition-colors",
                  c.id === selectedClientId ? "bg-zinc-900" : "hover:bg-zinc-900/50"
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectClient(c.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800"
                  aria-label={`Chat with ${c.name}`}
                >
                  <User className="h-4 w-4 text-zinc-500" />
                </button>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/clients/${c.id}/profile`}
                    className="block truncate text-sm font-medium text-white hover:text-[#6B93B8]"
                  >
                    {c.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onSelectClient(c.id)}
                    className="block min-w-0 text-left"
                  >
                    <p className="truncate text-xs text-zinc-500">{c.email}</p>
                    <p className="text-[10px] text-zinc-600">{c.tier_level}</p>
                  </button>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("text-[10px] font-semibold", daysLeft.className)}>
                    {daysLeft.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col bg-black",
            !selectedClientId ? "hidden lg:flex" : "flex"
          )}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3 sm:px-5 sm:py-4">
                <button
                  type="button"
                  onClick={() => onSelectClient("")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-900 lg:hidden"
                  aria-label="Back to clients"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                  <User className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/clients/${selected.id}/profile`}
                    className="block truncate text-sm font-bold text-white hover:text-[#6B93B8]"
                  >
                    {selected.name}
                  </Link>
                  <p className="text-xs text-zinc-500">{selected.tier_level}</p>
                </div>
                {selectedDaysLeft ? (
                  <p
                    className={cn(
                      "shrink-0 text-[10px] font-semibold",
                      selectedDaysLeft.className
                    )}
                  >
                    {selectedDaysLeft.text}
                  </p>
                ) : null}
              </div>

              <CoachWeeklyFeedbackForm clientId={selectedClientId} />

              <div className="flex min-h-0 flex-1 flex-col bg-black/50">
                {messagesLoading ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
                    Loading messages…
                  </div>
                ) : (
                  <ChatMessageList
                    messages={messages}
                    isOwnMessage={(m) => m.sender === "coach"}
                    peerLabel={selected.name}
                    emptyHint="Send a message to start coaching this client."
                  />
                )}

                <ChatComposer
                  content={content}
                  onContentChange={setContent}
                  onSend={send}
                  onAttach={onAttach}
                  canSend={Boolean(content.trim() || attachment)}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-zinc-500">
              <User className="mb-4 h-16 w-16 stroke-1" />
              <p className="text-sm">Select a client to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
