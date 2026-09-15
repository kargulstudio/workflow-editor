"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import type { MouseEvent, ReactEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLightboxGallery } from "./lightbox-gallery";

type ImageSource = string | StaticImageData;

export type LightboxImageProps = {
  src: ImageSource;
  alt: string;
  full?: ImageSource;
  fullWidth?: number;
  fullHeight?: number;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  blurDataURL?: string | null;
  priority?: boolean;
  loading?: "eager" | "lazy";
  draggable?: boolean;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
};

function toUrl(source?: ImageSource) {
  if (!source) return "";
  return typeof source === "string" ? source : source.src;
}

function toSize(source?: ImageSource) {
  if (!source || typeof source === "string") return null;
  return { width: source.width, height: source.height };
}

export default function LightboxImage({
  src,
  alt,
  full,
  fullWidth,
  fullHeight,
  width,
  height,
  fill = false,
  sizes,
  quality = 90,
  blurDataURL,
  priority,
  loading,
  draggable = false,
  className,
  imageClassName,
  children,
}: LightboxImageProps) {
  const { open, prefetch } = useLightboxGallery();

  const fullSource = full ?? src;
  const fullUrl = toUrl(fullSource);
  const fallbackSize = toSize(fullSource) ?? toSize(src);
  const resolvedWidth = fullWidth ?? fallbackSize?.width;
  const resolvedHeight = fullHeight ?? fallbackSize?.height;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    open(event.currentTarget);
  };

  const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
    if (resolvedWidth && resolvedHeight) return;

    const anchor =
      event.currentTarget.closest<HTMLAnchorElement>("a[data-pswp-item]");
    if (!anchor) return;

    anchor.dataset.pswpWidth = String(event.currentTarget.naturalWidth);
    anchor.dataset.pswpHeight = String(event.currentTarget.naturalHeight);
  };

  const sizeProps = fill
    ? { fill: true as const }
    : {
        width: width ?? toSize(src)?.width,
        height: height ?? toSize(src)?.height,
      };

  return (
    <a
      href={fullUrl}
      data-pswp-item=""
      data-pswp-src={fullUrl}
      data-pswp-width={resolvedWidth}
      data-pswp-height={resolvedHeight}
      data-pswp-alt={alt}
      aria-label={alt}
      draggable={draggable}
      onClick={handleClick}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      className={cn("relative block cursor-zoom-in", className)}
    >
      <Image
        {...sizeProps}
        src={src}
        alt={alt}
        sizes={sizes}
        quality={quality}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL ?? undefined}
        priority={priority}
        loading={loading}
        draggable={draggable}
        onLoad={handleLoad}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
      {children}
    </a>
  );
}
