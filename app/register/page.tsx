import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { getRegistrationEnabled } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const enabled = await getRegistrationEnabled();

  if (!enabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
        <h1 className="text-2xl font-bold text-white">Registration closed</h1>
        <p className="mt-2 max-w-sm text-zinc-400">
          Contact your coach for access. An admin account already exists.
        </p>
        <Link href="/login" className="mt-6 text-sm text-white underline">
          Back to login
        </Link>
      </div>
    );
  }

  return <RegisterForm />;
}
