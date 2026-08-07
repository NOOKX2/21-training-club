"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { AdminClient } from "@/lib/data";
import { cn } from "@/lib/utils";

const tabs = [
  { segment: "profile", label: "Profile" },
  { segment: "progress", label: "Progress" },
  { segment: "nutrition", label: "Nutrition" },
] as const;

export function AdminClientViewNav({ client }: { client: AdminClient }) {
  const pathname = usePathname();
  const base = `/admin/clients/${client.id}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/admin/chat?client=${client.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to chat
        </Link>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold uppercase tracking-wide text-white">
            {client.name}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {client.email} · {client.tier_level}
          </p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {tabs.map(({ segment, label }) => {
          const href = `${base}/${segment}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={segment}
              href={href}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                active
                  ? "bg-[#6B93B8] text-white"
                  : "border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
