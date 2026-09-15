"use client";

import Button from "@/components/_ui/button";
import ZoomInIcon from "@/public/assets/images/home/editor/workflow/zoom-in.svg";
import ZoomOutIcon from "@/public/assets/images/home/editor/workflow/zoom-out.svg";
import FitViewIcon from "@/public/assets/images/home/editor/workflow/fit-view.svg";

type WorkflowControlsProps = {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
};

export default function WorkflowControls({
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onFitView,
}: WorkflowControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Canvas zoom"
      onPointerDown={(event) => event.stopPropagation()}
      data-canvas-overlay
      className="absolute right-0 bottom-0 z-20 flex flex-col gap-2.5 p-4"
    >
      <Button
        variant="raised"
        size="icon"
        aria-label="Zoom in"
        disabled={!canZoomIn}
        onClick={onZoomIn}
      >
        <ZoomInIcon aria-hidden className="size-[18px]" />
      </Button>
      <Button
        variant="raised"
        size="icon"
        aria-label="Zoom out"
        disabled={!canZoomOut}
        onClick={onZoomOut}
      >
        <ZoomOutIcon aria-hidden className="size-[18px]" />
      </Button>
      <Button
        variant="raised"
        size="icon"
        aria-label="Fit workflow to screen"
        onClick={onFitView}
      >
        <FitViewIcon aria-hidden className="size-[18px]" />
      </Button>
    </div>
  );
}
