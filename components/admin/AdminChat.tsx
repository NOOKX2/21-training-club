"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Paperclip, Send, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-client";
import type { AdminClient, Coach, Message } from "@/lib/data";

export function AdminChat({
  clients,
  coaches,
  selectedClientId,
  initialMessages,
}: {
  clients: AdminClient[];
  coaches: Coach[];
  selectedClientId: string;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const coach = coaches[0];
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState("");

  const selected = clients.find((c) => c.id === selectedClientId);
  const messages = initialMessages;

  async function send() {
    if ((!content.trim() && !attachment) || !selectedClientId || !coach) return;
    await api("messages", {
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
    router.refresh();
  }

  function onAttach(f: File | null) {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment(reader.result as string);
    reader.readAsDataURL(f);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
        Chat with Clients
      </h1>

      <div className="flex h-[calc(100vh-12rem)] border border-zinc-800">
        <div className="w-72 shrink-0 overflow-y-auto border-r border-zinc-800 bg-zinc-950">
          <p className="border-b border-zinc-800 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white">
            Clients
          </p>
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/admin/chat?client=${c.id}`}
              className={`flex items-center gap-3 border-b border-zinc-800/50 px-4 py-3 transition-colors ${
                c.id === selectedClientId
                  ? "bg-zinc-900"
                  : "hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                <User className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{c.name}</p>
                <p className="truncate text-xs text-zinc-500">{c.email}</p>
                <p className="text-[10px] text-zinc-600">{c.tier_level}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-1 flex-col bg-black">
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800">
                  <User className="h-4 w-4 text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selected.name}</p>
                  <p className="text-xs text-zinc-500">{selected.tier_level}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.sender === "coach"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div
                      className={
                        m.sender === "coach"
                          ? "max-w-[80%] rounded-lg bg-[#a3e635] px-4 py-2 text-sm text-black"
                          : "max-w-[80%] rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white"
                      }
                    >
                      {m.attachment_base64 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.attachment_base64}
                          alt=""
                          className="mb-2 max-h-48 rounded object-cover"
                        />
                      ) : null}
                      {m.content && m.content !== "[Attachment]" && (
                        <p>{m.content}</p>
                      )}
                      <p className="mt-1 text-[10px] opacity-60">
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 border-t border-zinc-800 px-4 py-4">
                <label className="cursor-pointer text-zinc-400 hover:text-white">
                  <Paperclip className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onAttach(e.target.files?.[0] ?? null)}
                  />
                </label>
                <Input
                  placeholder="Type a message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  className="flex-1 border-zinc-700"
                />
                <button
                  type="button"
                  onClick={send}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a3e635] text-black hover:bg-[#bef264]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-zinc-500">
              <User className="mb-4 h-16 w-16 stroke-1" />
              <p className="text-sm">Select a client to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
