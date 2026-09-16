import { useSyncExternalStore } from "react";

const COMPACT_QUERY = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function snapshot() {
  return window.matchMedia(COMPACT_QUERY).matches;
}

export function useCompact() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
