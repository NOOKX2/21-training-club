import { DM_Sans, Inter } from "next/font/google";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { MuscleStatusLoader } from "@/components/MuscleStatusLoader";
import { buildAppSwrFallback } from "@/lib/app-swr-fallback";
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
  const swrFallback = await buildAppSwrFallback(user);
  return (
    <div className={`${inter.variable} ${dmSans.variable}`}>
      <AppShell user={user} swrFallback={swrFallback}>
        <Suspense fallback={null}>
          <MuscleStatusLoader userId={user.id} />
        </Suspense>
        {children}
      </AppShell>
    </div>
  );
}
