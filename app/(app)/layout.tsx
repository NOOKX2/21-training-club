import { DM_Sans, Inter } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { AppUserProvider } from "@/components/AppUserProvider";
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
  return (
    <div className={`${inter.variable} ${dmSans.variable}`}>
      <AppUserProvider user={user}>
        <AppShell user={user}>{children}</AppShell>
      </AppUserProvider>
    </div>
  );
}
