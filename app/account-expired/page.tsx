import { AccountExpiredClient } from "@/app/account-expired/_components/AccountExpiredClient";

export default async function AccountExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  return <AccountExpiredClient reason={params.reason} />;
}
