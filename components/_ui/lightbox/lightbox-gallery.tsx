"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { ReactNode } from "react";
import type PhotoSwipeLightbox from "photoswipe/lightbox";
import type { SlideData } from "photoswipe";
import "photoswipe/style.css";
import { cn } from "@/lib/utils";
import { closeIcon, leftIcon, rightIcon, zoomIcon } from "./lightbox-icons";

export const LIGHTBOX_ITEM_SELECTOR = "a[data-pswp-item]";

type LightboxContextValue = {
  id: string;
  open: (element: HTMLElement) => void;
  prefetch: () => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightboxGallery() {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error("LightboxImage must be rendered inside a LightboxGallery");
  }
  return context;
}

export type LightboxGalleryProps = {
  id: string;
  children: ReactNode;
  className?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  overlayBlur?: number;
  loop?: boolean;
  counter?: boolean;
  wheelToZoom?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

export default function LightboxGallery({
  id,
  children,
  className,
  overlayColor = "#000000",
  overlayOpacity = 0.9,
  overlayBlur = 0,
  loop = true,
  counter = true,
  wheelToZoom = true,
  onOpen,
  onClose,
}: LightboxGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<PhotoSwipeLightbox | null>(null);
  const pendingRef = useRef<Promise<PhotoSwipeLightbox | null> | null>(null);
  const unmountedRef = useRef(false);

  const optionsRef = useRef({
    overlayColor,
    overlayOpacity,
    overlayBlur,
    loop,
    counter,
    wheelToZoom,
    onOpen,
    onClose,
  });

  useEffect(() => {
    optionsRef.current = {
      overlayColor,
      overlayOpacity,
      overlayBlur,
      loop,
      counter,
      wheelToZoom,
      onOpen,
      onClose,
    };
  }, [
    overlayColor,
    overlayOpacity,
    overlayBlur,
    loop,
    counter,
    wheelToZoom,
    onOpen,
    onClose,
  ]);

  const load = useCallback(() => {
    if (instanceRef.current) return Promise.resolve(instanceRef.current);
    if (pendingRef.current) return pendingRef.current;

    pendingRef.current = import("photoswipe/lightbox").then(
      ({ default: Lightbox }) => {
        if (unmountedRef.current) return null;

        const options = optionsRef.current;
        const lightbox = new Lightbox({
          pswpModule: () => import("photoswipe"),
          mainClass: `lightbox-${id}`,
          bgOpacity: options.overlayOpacity,
          loop: options.loop,
          counter: options.counter,
          wheelToZoom: options.wheelToZoom,
          zoomSVG: zoomIcon,
          closeSVG: closeIcon,
          arrowPrevSVG: leftIcon,
          arrowNextSVG: rightIcon,
          padding: { top: 24, bottom: 24, left: 16, right: 16 },
        });

        lightbox.on("firstUpdate", () => {
          const element = lightbox.pswp?.element;
          if (!element) return;

          const current = optionsRef.current;
          element.style.setProperty("--pswp-bg", current.overlayColor);

          if (current.overlayBlur > 0) {
            const background = element.querySelector<HTMLElement>(".pswp__bg");
            if (background) {
              const blur = `blur(${current.overlayBlur}px)`;
              background.style.setProperty("backdrop-filter", blur);
              background.style.setProperty("-webkit-backdrop-filter", blur);
            }
          }
        });

        lightbox.on("beforeOpen", () => {
          optionsRef.current.onOpen?.();
        });

        lightbox.on("closingAnimationEnd", () => {
          optionsRef.current.onClose?.();
        });

        lightbox.init();
        instanceRef.current = lightbox;
        return lightbox;
      },
    );

    return pendingRef.current;
  }, [id]);

  const open = useCallback(
    (element: HTMLElement) => {
      const root = rootRef.current;
      if (!root) return;

      const items = Array.from(
        root.querySelectorAll<HTMLAnchorElement>(LIGHTBOX_ITEM_SELECTOR),
      );
      const index = items.indexOf(element as HTMLAnchorElement);
      if (index < 0) return;

      const dataSource = items.map((item) => {
        const width = Number(item.dataset.pswpWidth);
        const height = Number(item.dataset.pswpHeight);

        return {
          src: item.dataset.pswpSrc || item.href,
          width: Number.isFinite(width) && width > 0 ? width : undefined,
          height: Number.isFinite(height) && height > 0 ? height : undefined,
          alt: item.dataset.pswpAlt || "",
          msrc: item.querySelector("img")?.currentSrc || undefined,
          element: item,
        } satisfies SlideData;
      });

      load().then((lightbox) => {
        if (unmountedRef.current) return;
        lightbox?.loadAndOpen(index, dataSource);
      });
    },
    [load],
  );

  const prefetch = useCallback(() => {
    void load();
  }, [load]);

  useEffect(() => {
    unmountedRef.current = false;

    return () => {
      unmountedRef.current = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
      pendingRef.current = null;
    };
  }, []);

  const value = useMemo(() => ({ id, open, prefetch }), [id, open, prefetch]);

  return (
    <LightboxContext.Provider value={value}>
      <div
        ref={rootRef}
        id={id}
        data-lightbox-gallery={id}
        className={cn(className)}
      >
        {children}
      </div>
    </LightboxContext.Provider>
  );
}
