import Image from "next/image";
import { assetMediaClass } from "./asset-frame";
import type {
  AssetImageProps,
  AssetImageSource,
  AssetSvgComponent,
} from "./asset-types";

function isSvgComponent(src: AssetImageSource): src is AssetSvgComponent {
  return (
    typeof src === "function" ||
    (typeof src === "object" && src !== null && "$$typeof" in src)
  );
}

function isRawSource(src: AssetImageSource) {
  if (typeof src !== "string") return false;
  return src.startsWith("data:") || src.split("?")[0].endsWith(".svg");
}

function AssetImage({
  src,
  alt,
  fit,
  mediaClassName,
  sizes = "100vw",
  quality = 90,
  blurDataURL,
  priority,
  loading,
}: AssetImageProps) {
  if (isSvgComponent(src)) {
    const Svg = src;

    return (
      <Svg
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={assetMediaClass(fit, mediaClassName)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL ?? undefined}
      priority={priority}
      loading={priority ? undefined : loading}
      unoptimized={isRawSource(src)}
      className={assetMediaClass(fit, mediaClassName)}
    />
  );
}

export default AssetImage;
