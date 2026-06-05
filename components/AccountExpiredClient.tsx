"use client";

import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api-client";

export function AccountExpiredClient({ reason }: { reason?: string }) {
  const title =
    reason === "not_started" ? "Account Not Active Yet" : "Account Expired";
  const description =
    reason === "not_started"
      ? "Your membership has not started yet. Please contact your coach for access dates."
      : "Your membership has expired. Your data is still saved, but you cannot use the app until your coach renews access.";

  async function logout() {
    await api("auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
        <Button type="button" className="w-full" onClick={logout}>
          Back to Login
        </Button>
      </div>
    </div>
  );
}
