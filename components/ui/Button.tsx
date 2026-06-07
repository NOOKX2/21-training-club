import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "outline" | "ghost" | "dark" | "save";
  }
>(function Button({ className, variant = "primary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-wider transition-colors disabled:opacity-50",
        variant === "primary" && "bg-white text-black hover:bg-zinc-200",
        variant === "outline" &&
          "border border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5",
        variant === "ghost" && "text-white/45 hover:text-white",
        variant === "dark" &&
          "border border-white/10 bg-black/50 text-white hover:bg-black/70",
        variant === "save" &&
          "border border-white/75 bg-transparent text-white hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
});
