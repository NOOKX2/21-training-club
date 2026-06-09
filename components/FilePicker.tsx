"use client";

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { MOBILE_FILE_INPUT_CLASS } from "@/lib/file-upload";

type FilePickerProps = {
  accept: string;
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
  multiple?: boolean;
  children: ReactNode;
  disabled?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">;

export function FilePicker({
  accept,
  onFile,
  onFiles,
  multiple = false,
  children,
  disabled,
  className,
  ...buttonProps
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className={MOBILE_FILE_INPUT_CLASS}
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          if (selected.length > 0) {
            if (onFiles) onFiles(selected);
            else onFile?.(selected[0]);
          }
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        className={className}
        onClick={() => inputRef.current?.click()}
        {...buttonProps}
      >
        {children}
      </button>
    </>
  );
}
