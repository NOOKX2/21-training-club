import { DM_Sans, Inter } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { getDailyMuscleStatus } from "@/lib/muscle-streak";
import { requireAppUser } from "@/lib/session";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAppUser();
  const muscleStatus = await getDailyMuscleStatus(user.id);
  return (
    <div className={`${inter.variable} ${dmSans.variable}`}>
      <AppShell user={user} muscleStatus={muscleStatus}>
        {children}
      </AppShell>
    </div>
  );
}
