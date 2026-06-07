"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Crown,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Timer,
  User as UserIcon,
} from "lucide-react";
import { ClientAppBackground } from "@/components/ClientAppBackground";
import { ClientBrandLogo } from "@/components/ClientBrandLogo";
import { MuscleStreakBadges } from "@/components/MuscleStreakBadges";
import { NotificationBell } from "@/components/NotificationBell";
import { PromoMarquee } from "@/components/PromoMarquee";
import {
  MuscleStreakProvider,
  useMuscleStreakStatus,
} from "@/components/MuscleStreakContext";
import { api, type User } from "@/lib/api-client";
import { clientGlassNav } from "@/lib/client-ui";
import type { DailyMuscleStatus } from "@/lib/muscle-streak-types";
import { isAdminRole } from "@/lib/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/workouts", label: "Workouts", icon: LayoutGrid },
  { href: "/nutrition", label: "Nutrition", icon: Timer },
  { href: "/progress", label: "Progress", icon: Activity },
  { href: "/coach", label: "Coach", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

function tierBadgeLabel(tier: string) {
  if (tier === "Tier 3") return "TIER 3: VIP";
  if (tier === "Admin") return "ADMIN";
  return tier.toUpperCase();
}

function AppShellHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const streakStatus = useMuscleStreakStatus();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await api("auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isVip = user.tier_level === "Tier 3" || user.tier_level === "Admin";

  if (!streakStatus) return null;

  return (
    <div className="grid min-h-[69px] grid-cols-[1fr_auto] items-center gap-x-2 py-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-4">
      {/* Left: streak badges */}
      <div className="hidden min-w-0 justify-self-start lg:block">
        <MuscleStreakBadges status={streakStatus} compact />
      </div>

      {/* Center: logo + nav */}
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-1 sm:gap-2">
        <ClientBrandLogo compact className="mr-2 sm:mr-6 lg:mr-10" />
        <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[10px] px-3 py-2 transition-colors sm:px-[18px]",
                  active
                    ? cn(clientGlassNav, "text-white")
                    : "text-white/45 hover:bg-white/[0.07] hover:text-white"
                )}
              >
                <Icon
                  className={cn("h-[18px] w-[18px]", active ? "stroke-white" : "stroke-current")}
                  strokeWidth={2}
                />
                <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                  {label}
                </span>
              </Link>
            );
          })}
          {isAdminRole(user.role) && (
            <Link
              href="/admin"
              className={cn(
                "rounded-[10px] px-3 py-2 text-[10px] font-semibold tracking-widest uppercase",
                pathname.startsWith("/admin")
                  ? cn(clientGlassNav, "text-white")
                  : "text-white/45 hover:bg-white/[0.07]"
              )}
            >
              Admin
            </Link>
          )}
        </nav>
      </div>

      {/* Right: notifications + account */}
      <div className="flex shrink-0 items-center justify-self-end gap-2 sm:gap-3">
        <NotificationBell />
        {isVip ? (
          <span className="hidden items-center gap-1.5 rounded-md bg-[#C5F135] px-2 py-1 text-[9px] font-bold tracking-wide text-black md:flex">
            <Crown className="h-3.5 w-3.5" />
            {tierBadgeLabel(user.tier_level)}
          </span>
        ) : null}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black/50"
            aria-label="Account menu"
          >
            {user.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile_photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-4 w-4 text-white/45" />
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-black/90 py-2 shadow-xl backdrop-blur-md">
              <div className="border-b border-white/10 px-4 pb-3">
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-xs text-white/45">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  user,
  muscleStatus,
  children,
}: {
  user: User;
  muscleStatus: DailyMuscleStatus;
  children: React.ReactNode;
}) {
  return (
    <MuscleStreakProvider initialStatus={muscleStatus}>
      <div className="relative min-h-screen bg-[#0d0d0d] font-[family-name:var(--font-dm-sans)] text-[#F0F4F8]">
        <ClientAppBackground />

        <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/55 backdrop-blur-xl">
          <div className="mx-auto w-full max-w-[1440px] px-8 sm:px-10 lg:px-14 xl:px-16">
            <AppShellHeader user={user} />
            <PromoMarquee />
          </div>
        </header>

        <main className="relative z-10 mx-auto w-full max-w-[900px] px-6 pt-[120px] pb-16">
          {children}
        </main>
      </div>
    </MuscleStreakProvider>
  );
}
