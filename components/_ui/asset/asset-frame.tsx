import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AssetFit } from "./asset-types";

const ASSET_FIT: Record<AssetFit, string> = {
  cover: "object-cover",
  contain: "object-contain",
  fill: "object-fill",
  none: "object-none",
};

export function assetMediaClass(fit: AssetFit = "cover", className?: string) {
  return cn("absolute inset-0 size-full", ASSET_FIT[fit], className);
}

type AssetFrameProps = {
  width: number;
  height: number;
  className?: string;
  children: ReactNode;
};

function AssetFrame({ width, height, className, children }: AssetFrameProps) {
  return (
    <div
      style={{ "--asset-ratio": `${width} / ${height}` } as CSSProperties}
      className={cn(
        "relative aspect-(--asset-ratio) w-full overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default AssetFrame;
