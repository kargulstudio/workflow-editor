import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

const LCP_SETTLE_MS = 500;
const LOAD_WAIT_AFTER_SETTLE_MS = 4000;
const LCP_MAX_WAIT_MS = 8000;
const LOAD_IDLE_TIMEOUT_MS = 1500;
const NAVIGATION_IDLE_TIMEOUT_MS = 1000;
const IDLE_AFTER_LCP_MS = 6000;
const SCROLL_EVENTS = ["scroll", "wheel", "touchmove"] as const;

function createFlag<T>(initial: T) {
  const subscribers = new Set<() => void>();
  let value = initial;
  return {
    get: () => value,
    set(next: T) {
      if (value === next) return;
      value = next;
      subscribers.forEach((notify) => notify());
    },
    subscribe(notify: () => void) {
      subscribers.add(notify);
      return () => {
        subscribers.delete(notify);
      };
    },
  };
}

const lcpPath = createFlag<string | null>(null);
const idlePath = createFlag<string | null>(null);
const scrolled = createFlag(false);

let armedPath: string | null = null;
let cleanups: Array<() => void> = [];
let idleTimer: number | undefined;

export function runWhenIdle(callback: () => void, timeout: number) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout });
  } else {
    window.setTimeout(callback, 50);
  }
}

function cleanup() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
}

function openGate() {
  if (lcpPath.get() === armedPath) return;
  cleanup();
  lcpPath.set(armedPath);
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(
    () => runWhenIdle(() => idlePath.set(armedPath), 1000),
    IDLE_AFTER_LCP_MS,
  );
}

function watchLcp() {
  const supported =
    typeof PerformanceObserver !== "undefined" &&
    (PerformanceObserver.supportedEntryTypes?.includes(
      "largest-contentful-paint",
    ) ??
      false);
  let settled = false;
  let loaded = document.readyState === "complete";

  const tryOpen = () => {
    if (settled && loaded) openGate();
  };
  const onLoad = () => {
    loaded = true;
    if (supported) tryOpen();
    else runWhenIdle(openGate, LOAD_IDLE_TIMEOUT_MS);
  };

  if (loaded) {
    if (!supported) onLoad();
  } else {
    window.addEventListener("load", onLoad, { once: true });
    cleanups.push(() => window.removeEventListener("load", onLoad));
  }

  if (supported) {
    let settleTimer: number | undefined;
    const observer = new PerformanceObserver(() => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settled = true;
        observer.disconnect();
        tryOpen();
        if (lcpPath.get() === armedPath) return;
        const loadWait = window.setTimeout(openGate, LOAD_WAIT_AFTER_SETTLE_MS);
        cleanups.push(() => window.clearTimeout(loadWait));
      }, LCP_SETTLE_MS);
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
    cleanups.push(() => {
      observer.disconnect();
      window.clearTimeout(settleTimer);
    });
  }

  const maxWait = window.setTimeout(openGate, LCP_MAX_WAIT_MS);
  cleanups.push(() => window.clearTimeout(maxWait));
}

function watchNavigation() {
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      runWhenIdle(openGate, NAVIGATION_IDLE_TIMEOUT_MS),
    ),
  );
}

function armGate(pathname: string) {
  if (armedPath === pathname) return;
  const first = armedPath === null;
  armedPath = pathname;
  cleanup();
  window.clearTimeout(idleTimer);
  if (first) watchLcp();
  else watchNavigation();
}

function markScrolled() {
  scrolled.set(true);
}

if (typeof window !== "undefined") {
  SCROLL_EVENTS.forEach((event) =>
    window.addEventListener(event, markScrolled, { once: true, passive: true }),
  );
}

const getServerNull = () => null;
const getServerFalse = () => false;

export function useAfterLcp() {
  const pathname = usePathname();
  const openFor = useSyncExternalStore(
    lcpPath.subscribe,
    lcpPath.get,
    getServerNull,
  );

  useEffect(() => {
    armGate(pathname);
  }, [pathname]);

  return openFor === pathname;
}

export function useIdleAfterLcp() {
  const pathname = usePathname();
  const idleFor = useSyncExternalStore(
    idlePath.subscribe,
    idlePath.get,
    getServerNull,
  );
  return idleFor === pathname;
}

export function useHasScrolled() {
  return useSyncExternalStore(scrolled.subscribe, scrolled.get, getServerFalse);
}

function useIntersects(
  ref: RefObject<Element | null>,
  rootMargin: string,
  threshold: number,
  once: boolean,
) {
  const [intersects, setIntersects] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        if (once) {
          if (hit) {
            setIntersects(true);
            observer.disconnect();
          }
        } else {
          setIntersects(hit);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return intersects;
}

export function useInViewport(ref: RefObject<Element | null>) {
  return useIntersects(ref, "0px", 0.1, true);
}

export function useNearViewport(ref: RefObject<Element | null>) {
  return useIntersects(ref, "50% 0px", 0, true);
}

export function useOnScreen(ref: RefObject<Element | null>) {
  return useIntersects(ref, "25% 0px", 0, false);
}
