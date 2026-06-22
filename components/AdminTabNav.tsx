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
import { Suspense } from "react";
import { AdminChatPageView } from "@/components/admin-pages/AdminChatPageView";
import { AdminClientsPageView } from "@/components/admin-pages/AdminClientsPageView";
import { AdminCustomProgramsPageView } from "@/components/admin-pages/AdminCustomProgramsPageView";
import { AdminDashboardPageView } from "@/components/admin-pages/AdminDashboardPageView";
import { AdminFormChecksPageView } from "@/components/admin-pages/AdminFormChecksPageView";
import { AdminNutritionPageView } from "@/components/admin-pages/AdminNutritionPageView";
import { AdminProgramsPageView } from "@/components/admin-pages/AdminProgramsPageView";
import { AdminResultsPageView } from "@/components/admin-pages/AdminResultsPageView";
import { AdminVideosPageView } from "@/components/admin-pages/AdminVideosPageView";
import { AdminWeightVerificationPageView } from "@/components/admin-pages/AdminWeightVerificationPageView";
import {
  ADMIN_TAB_ROUTES,
  isAdminTabRoute,
  type AdminTabRoute,
} from "@/lib/admin-tabs";

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

function AdminTabPanel({
  active,
  mounted,
  children,
}: {
  active: boolean;
  mounted: boolean;
  children: ReactNode;
}) {
  if (!mounted || !active) return null;
  return <div>{children}</div>;
}

function tabView(route: AdminTabRoute) {
  switch (route) {
    case "/admin":
      return <AdminDashboardPageView />;
    case "/admin/clients":
      return <AdminClientsPageView />;
    case "/admin/chat":
      return (
        <Suspense fallback={null}>
          <AdminChatPageView />
        </Suspense>
      );
    case "/admin/programs":
      return (
        <Suspense fallback={null}>
          <AdminProgramsPageView />
        </Suspense>
      );
    case "/admin/custom-programs":
      return (
        <Suspense fallback={null}>
          <AdminCustomProgramsPageView />
        </Suspense>
      );
    case "/admin/results":
      return (
        <Suspense fallback={null}>
          <AdminResultsPageView />
        </Suspense>
      );
    case "/admin/weight-verification":
      return <AdminWeightVerificationPageView />;
    case "/admin/videos":
      return <AdminVideosPageView />;
    case "/admin/nutrition":
      return (
        <Suspense fallback={null}>
          <AdminNutritionPageView />
        </Suspense>
      );
    case "/admin/form-checks":
      return <AdminFormChecksPageView />;
  }
}

export function AdminTabContent({ children }: { children: ReactNode }) {
  const { activePath } = useAdminTabNav();
  const [mountedTabs, setMountedTabs] = useState<Set<AdminTabRoute>>(() =>
    isAdminTabRoute(activePath) ? new Set([activePath]) : new Set()
  );

  useEffect(() => {
    if (!isAdminTabRoute(activePath)) return;
    setMountedTabs((current) => {
      if (current.has(activePath)) return current;
      const next = new Set(current);
      next.add(activePath);
      return next;
    });
  }, [activePath]);

  if (!isAdminTabRoute(activePath)) {
    return children;
  }

  return (
    <>
      {ADMIN_TAB_ROUTES.map((route) => (
        <AdminTabPanel
          key={route}
          active={activePath === route}
          mounted={mountedTabs.has(route)}
        >
          {tabView(route)}
        </AdminTabPanel>
      ))}
    </>
  );
}
