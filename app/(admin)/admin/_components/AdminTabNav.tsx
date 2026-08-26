"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAdminTabRoute } from "@/lib/admin-tabs";

type AdminTabNavContextValue = {
  activePath: string;
  navigateToTab: (href: string) => void;
  isTabActive: (href: string) => boolean;
};

const AdminTabNavContext = createContext<AdminTabNavContextValue | null>(null);

function readPathname(): string {
  if (typeof window === "undefined") return "/admin";
  return window.location.pathname;
}

export function AdminTabNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [clientPath, setClientPath] = useState<string | null>(null);

  useEffect(() => {
    function onPopState() {
      setClientPath(readPathname());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const activePath = useMemo(() => {
    if (
      clientPath &&
      pathname !== clientPath &&
      pathname.startsWith(`${clientPath}/`)
    ) {
      return pathname;
    }
    return clientPath ?? pathname;
  }, [clientPath, pathname]);

  const navigateToTab = useCallback(
    (href: string) => {
      const base = href.split("?")[0];
      if (!isAdminTabRoute(base)) {
        setClientPath(null);
        router.push(href);
        return;
      }

      setClientPath(base);
      window.history.pushState({ adminTab: base }, "", href);
      if (pathname !== base && !pathname.startsWith(`${base}/`)) {
        router.replace(href, { scroll: false });
      }
    },
    [router, pathname]
  );

  const isTabActive = useCallback(
    (href: string) => {
      const base = href.split("?")[0];
      if (base === "/admin") return activePath === "/admin";
      return activePath === base || activePath.startsWith(`${base}/`);
    },
    [activePath]
  );

  const value = useMemo(
    () => ({ activePath, navigateToTab, isTabActive }),
    [activePath, navigateToTab, isTabActive]
  );

  return (
    <AdminTabNavContext.Provider value={value}>
      {children}
    </AdminTabNavContext.Provider>
  );
}

export function useAdminTabNav() {
  const ctx = useContext(AdminTabNavContext);
  if (!ctx) {
    throw new Error("useAdminTabNav must be used within AdminTabNavProvider");
  }
  return ctx;
}

export function AdminTabLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const { navigateToTab } = useAdminTabNav();
  const base = href.split("?")[0];

  if (!isAdminTabRoute(base)) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
        navigateToTab(href);
      }}
    >
      {children}
    </a>
  );
}

export function AdminTabContent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
