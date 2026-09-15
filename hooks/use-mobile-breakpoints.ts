"use client";

import { useSyncExternalStore } from "react";

/**
 * Tailwind default breakpoints (px) – keep in sync with Tailwind config.
 * sm: 640, md: 768, lg: 1024
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
} as const;

export type MobileBreakpointState = {
  belowSm: boolean;
  belowMd: boolean;
  belowLg: boolean;
  width: number;
};

const SERVER_STATE: MobileBreakpointState = {
  belowSm: false,
  belowMd: false,
  belowLg: false,
  width: 0,
};

let cachedState: MobileBreakpointState = SERVER_STATE;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getSnapshot(): MobileBreakpointState {
  const width = window.innerWidth;
  if (cachedState.width === width) return cachedState;
  cachedState = {
    belowSm: width < BREAKPOINTS.sm,
    belowMd: width < BREAKPOINTS.md,
    belowLg: width < BREAKPOINTS.lg,
    width,
  };
  return cachedState;
}

function getServerSnapshot(): MobileBreakpointState {
  return SERVER_STATE;
}

/**
 * Returns viewport state relative to Tailwind breakpoints (sm, md, lg)
 * and updates on window resize. Names align with Tailwind-style classes:
 * below-sm, below-md, below-lg.
 */
export function useMobileBreakpoints(): MobileBreakpointState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Builds a class string of current "below-*" Tailwind-style classes,
 * e.g. "below-lg below-md below-sm" when viewport is below sm.
 * Use with your Tailwind config / CSS that defines these classes.
 */
export function getBelowBreakpointClasses(
  state: MobileBreakpointState,
): string {
  const classes: string[] = [];
  if (state.belowLg) classes.push("below-lg");
  if (state.belowMd) classes.push("below-md");
  if (state.belowSm) classes.push("below-sm");
  return classes.join(" ");
}
