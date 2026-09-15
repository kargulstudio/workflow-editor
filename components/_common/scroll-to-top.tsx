"use client";

import React from "react";
import { usePathname } from "next/navigation";

const STORAGE_PREFIX = "scroll-position:";
const RESTORE_FRAMES = 12;

if (typeof window !== "undefined") {
  window.history.scrollRestoration = "manual";
}

function navigationType() {
  const entry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type;
}

function readPosition(path: string) {
  try {
    const stored = sessionStorage.getItem(STORAGE_PREFIX + path);
    const value = stored === null ? NaN : Number(stored);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function savePosition(path: string) {
  try {
    sessionStorage.setItem(
      STORAGE_PREFIX + path,
      String(Math.round(window.scrollY)),
    );
  } catch {}
}

function scrollInstantly(scroll: () => void) {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  root.getClientRects();
  scroll();
  root.style.scrollBehavior = previous;
}

function ScrollToTop() {
  const pathname = usePathname();
  const committed = React.useRef<string | null>(null);
  const traversalTarget = React.useRef<string | null>(null);

  React.useEffect(() => {
    const onPopState = () => {
      const target = window.location.pathname;
      traversalTarget.current = target === committed.current ? null : target;
    };
    const save = () => savePosition(window.location.pathname);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") save();
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  React.useLayoutEffect(() => {
    const path = window.location.pathname;
    const initial = committed.current === null;
    const changed = committed.current !== path;
    committed.current = path;

    if (changed) {
      const type = initial ? navigationType() : undefined;
      const traversal =
        traversalTarget.current === path || type === "back_forward";

      if (traversal) {
        traversalTarget.current = null;
        const top = readPosition(path) ?? 0;
        let attempts = 0;
        const restore = () => {
          if (committed.current !== path) return;
          scrollInstantly(() => window.scrollTo(0, top));
          const reachable =
            document.documentElement.scrollHeight - window.innerHeight >= top;
          if (!reachable && attempts < RESTORE_FRAMES) {
            attempts += 1;
            window.requestAnimationFrame(restore);
          }
        };
        restore();
      } else if (window.location.hash) {
        const target = initial
          ? document.getElementById(window.location.hash.slice(1))
          : null;
        if (target) scrollInstantly(() => target.scrollIntoView());
      } else {
        scrollInstantly(() => window.scrollTo(0, 0));
      }
    }

    return () => savePosition(path);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
