import type { StaticImageData } from "next/image";
import type { ComponentType, SVGProps } from "react";

export type AssetSvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type AssetImageSource = string | StaticImageData | AssetSvgComponent;

export type AssetFit = "cover" | "contain" | "fill" | "none";

type AssetBaseProps = {
  width: number;
  height: number;
  fit?: AssetFit;
  className?: string;
  mediaClassName?: string;
};

export type AssetImageProps = AssetBaseProps & {
  type: "image";
  src: AssetImageSource;
  alt: string;
  sizes?: string;
  quality?: number;
  blurDataURL?: string | null;
  priority?: boolean;
  loading?: "eager" | "lazy";
};

export type AssetVideoProps = AssetBaseProps & {
  type: "video";
  src: string;
  poster: string;
  stillPoster?: string;
  alt?: string;
  mobileSrc?: string;
};

export type AssetRiveProps = AssetBaseProps & {
  type: "rive";
  src: string;
  poster: string;
  alt: string;
  artboard?: string;
  animations?: string | string[];
  stateMachines?: string | string[];
  autoplay?: boolean;
  priority?: boolean;
};

export type AssetLottieProps = AssetBaseProps & {
  type: "lottie";
  src: string;
  poster: string;
  alt: string;
  loop?: boolean;
  autoplay?: boolean;
};

export type AssetProps =
  | AssetImageProps
  | AssetVideoProps
  | AssetRiveProps
  | AssetLottieProps;
