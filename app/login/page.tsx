import type { Metadata } from "next";
import { LoginScreen } from "@/app/login/_components/LoginScreen";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return <LoginScreen />;
}
