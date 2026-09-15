"use client";

import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";
import { useEffect } from "react";
import type { AssetFit } from "./asset-types";

const RIVE_FIT: Record<AssetFit, Fit> = {
  cover: Fit.Cover,
  contain: Fit.Contain,
  fill: Fit.Fill,
  none: Fit.None,
};

export type AssetRiveCanvasProps = {
  buffer: ArrayBuffer;
  fit?: AssetFit;
  artboard?: string;
  animations?: string | string[];
  stateMachines?: string | string[];
  autoplay?: boolean;
  active?: boolean;
  className?: string;
  onLoad?: () => void;
};

function AssetRiveCanvas({
  buffer,
  fit = "cover",
  artboard,
  animations,
  stateMachines,
  autoplay = true,
  active = true,
  className,
  onLoad,
}: AssetRiveCanvasProps) {
  const { rive, RiveComponent } = useRive({
    buffer,
    artboard,
    animations,
    stateMachines,
    autoplay,
    layout: new Layout({ fit: RIVE_FIT[fit], alignment: Alignment.Center }),
    onLoad,
  });

  useEffect(() => {
    if (!rive || !autoplay) return;
    if (active) rive.play();
    else rive.pause();
  }, [rive, active, autoplay]);

  return <RiveComponent className={className} />;
}

export default AssetRiveCanvas;
