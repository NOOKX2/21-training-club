"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PREFETCH_ROUTES = [
  "/workouts",
  "/nutrition",
  "/progress",
  "/coach",
  "/profile",
] as const;

export function PrefetchAppRoutes() {
  const router = useRouter();

  useEffect(() => {
    for (const href of PREFETCH_ROUTES) {
      router.prefetch(href);
    }
  }, [router]);

  return null;
}
