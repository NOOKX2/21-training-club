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
import { CoachPageView } from "@/components/app-pages/CoachPageView";
import { NutritionPageView } from "@/components/app-pages/NutritionPageView";
import { ProfilePageView } from "@/components/app-pages/ProfilePageView";
import { ProgressPageView } from "@/components/app-pages/ProgressPageView";
import { WorkoutsPageView } from "@/components/app-pages/WorkoutsPageView";
import {
  isMainTabRoute,
  MAIN_TAB_ROUTES,
  type MainTabRoute,
} from "@/lib/main-tabs";

type MainTabNavContextValue = {
  activePath: string;
  navigateToTab: (href: string) => void;
  isTabActive: (href: string) => boolean;
};

const MainTabNavContext = createContext<MainTabNavContextValue | null>(null);

function readPathname(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

export function MainTabNavProvider({ children }: { children: ReactNode }) {
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
      if (!isMainTabRoute(base)) {
        setClientPath(null);
        router.push(href);
        return;
      }

      setClientPath(base);
      window.history.pushState({ mainTab: base }, "", href);
      if (pathname !== base) {
        router.replace(href, { scroll: false });
      }
    },
    [router, pathname]
  );

  const isTabActive = useCallback(
    (href: string) => {
      const base = href.split("?")[0];
      return activePath === base || activePath.startsWith(`${base}/`);
    },
    [activePath]
  );

  const value = useMemo(
    () => ({ activePath, navigateToTab, isTabActive }),
    [activePath, navigateToTab, isTabActive]
  );

  return (
    <MainTabNavContext.Provider value={value}>
      {children}
    </MainTabNavContext.Provider>
  );
}

export function useMainTabNav() {
  const ctx = useContext(MainTabNavContext);
  if (!ctx) {
    throw new Error("useMainTabNav must be used within MainTabNavProvider");
  }
  return ctx;
}

export function MainTabLink({
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
  const { navigateToTab } = useMainTabNav();
  const base = href.split("?")[0];

  if (!isMainTabRoute(base)) {
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

function MainTabPanel({
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

function tabView(route: MainTabRoute) {
  switch (route) {
    case "/workouts":
      return (
        <Suspense fallback={null}>
          <WorkoutsPageView />
        </Suspense>
      );
    case "/nutrition":
      return (
        <Suspense fallback={null}>
          <NutritionPageView />
        </Suspense>
      );
    case "/progress":
      return <ProgressPageView />;
    case "/coach":
      return (
        <Suspense fallback={null}>
          <CoachPageView />
        </Suspense>
      );
    case "/profile":
      return <ProfilePageView />;
  }
}

export function MainTabContent({ children }: { children: ReactNode }) {
  const { activePath } = useMainTabNav();
  const [mountedTabs, setMountedTabs] = useState<Set<MainTabRoute>>(() =>
    isMainTabRoute(activePath) ? new Set([activePath]) : new Set()
  );

  useEffect(() => {
    if (!isMainTabRoute(activePath)) return;
    setMountedTabs((current) => {
      if (current.has(activePath)) return current;
      const next = new Set(current);
      next.add(activePath);
      return next;
    });
  }, [activePath]);

  if (!isMainTabRoute(activePath)) {
    return children;
  }

  return (
    <>
      {MAIN_TAB_ROUTES.map((route) => (
        <MainTabPanel
          key={route}
          active={activePath === route}
          mounted={mountedTabs.has(route)}
        >
          {tabView(route)}
        </MainTabPanel>
      ))}
    </>
  );
}
