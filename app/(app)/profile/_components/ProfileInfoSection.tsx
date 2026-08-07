"use client";

import { useRef } from "react";
import { Camera, User } from "lucide-react";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useLanguage } from "@/components/LanguageProvider";
import { clientCard } from "@/lib/client-ui";
import { MOBILE_FILE_INPUT_CLASS } from "@/lib/file-upload";
import { cn } from "@/lib/utils";

export function ProfileInfoSection({
  name,
  email,
  tdee,
  userTdee,
  editing,
  message,
  avatarSrc,
  profileSavedMessage,
  onNameChange,
  onTdeeChange,
  onPhotoSelect,
}: {
  name: string;
  email: string;
  tdee: string;
  userTdee: number | null;
  editing: boolean;
  message: string;
  avatarSrc: string;
  profileSavedMessage: string;
  onNameChange: (value: string) => void;
  onTdeeChange: (value: string) => void;
  onPhotoSelect: (file: File | null) => void;
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className={cn(clientCard, "p-4 sm:p-6")}>
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="shrink-0">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#6b93b8]/30">
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt={name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-white/30" />
            )}
          </div>
          {editing ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={MOBILE_FILE_INPUT_CLASS}
                aria-hidden
                tabIndex={-1}
                onChange={(e) => onPhotoSelect(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex w-24 items-center justify-center gap-1.5 rounded-xl border border-white/10 px-2 py-2 text-[10px] font-medium uppercase tracking-wide text-white/60 hover:border-white/25 hover:text-white"
              >
                <Camera className="h-3.5 w-3.5" />
                {t("profile.upload")}
              </button>
            </>
          ) : null}
        </div>
        <div className="flex-1 space-y-5">
          <div>
            <FieldLabel>{t("profile.fullName")}</FieldLabel>
            {editing ? (
              <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
            ) : (
              <p className="text-lg font-bold uppercase text-white">{name}</p>
            )}
          </div>
          <div>
            <FieldLabel>{t("profile.email")}</FieldLabel>
            <p className="text-lg text-white">{email}</p>
          </div>
          <div>
            <FieldLabel>{t("profile.tdee")}</FieldLabel>
            {editing ? (
              <Input
                type="number"
                min={1}
                value={tdee}
                onChange={(e) => onTdeeChange(e.target.value)}
                placeholder={t("profile.tdeePlaceholder")}
              />
            ) : (
              <p className="text-lg text-white">
                {userTdee != null
                  ? `${userTdee.toLocaleString()} ${t("common.kcal")}`
                  : t("common.notSet")}
              </p>
            )}
            <p className="mt-1 text-xs text-white/40">{t("profile.tdeeHint")}</p>
          </div>
        </div>
      </div>
      {message ? (
        <p
          className={`mt-4 text-sm ${
            message === profileSavedMessage ? "text-[#6B93B8]" : "text-red-400"
          }`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
