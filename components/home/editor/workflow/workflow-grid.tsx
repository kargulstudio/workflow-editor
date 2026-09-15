"use client";

import { useEffect, useRef } from "react";
import { useWorkflowStore, type WorkflowView } from "@/stores/workflow-store";
import { GRID_SIZE } from "./workflow-geometry";

const DOT_COLOR = "#1b1b20";
const DOT_RADIUS = 1.15;
const LEVELS = 4;
const FADE_START = 6;
const FADE_END = 10;

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function levelOf(index: number) {
  if (index === 0) return LEVELS - 1;
  return Math.min(LEVELS - 1, 31 - Math.clz32(index & -index));
}

function drawGrid(
  context: CanvasRenderingContext2D,
  view: WorkflowView,
  width: number,
  height: number,
  ratio: number,
) {
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const alphas = Array.from({ length: LEVELS }, (_, level) =>
    smoothstep(FADE_START, FADE_END, GRID_SIZE * 2 ** level * view.zoom),
  );
  const first = Math.max(
    0,
    alphas.findIndex((alpha) => alpha > 0.01),
  );
  const unit = 2 ** first;
  const step = GRID_SIZE * unit * view.zoom;
  const originX = width / 2 + view.x;
  const originY = view.y;
  const radius = Math.max(0.75, DOT_RADIUS * Math.sqrt(view.zoom));
  const round = radius * ratio >= 1.5;
  const snap = (value: number) => (Math.floor(value * ratio) + 0.5) / ratio;

  const paths = alphas.map(() => new Path2D());
  const startColumn = Math.ceil((-radius - originX) / step);
  const endColumn = Math.floor((width + radius - originX) / step);
  const startRow = Math.ceil((-radius - originY) / step);
  const endRow = Math.floor((height + radius - originY) / step);

  for (let row = startRow; row <= endRow; row++) {
    const y = snap(originY + row * step);
    const rowLevel = levelOf(row * unit);
    for (let column = startColumn; column <= endColumn; column++) {
      const path = paths[Math.min(rowLevel, levelOf(column * unit))];
      const x = snap(originX + column * step);
      if (round) {
        path.moveTo(x + radius, y);
        path.arc(x, y, radius, 0, Math.PI * 2);
      } else {
        path.rect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
  }

  context.fillStyle = DOT_COLOR;
  paths.forEach((path, level) => {
    if (alphas[level] <= 0.01) return;
    context.globalAlpha = alphas[level];
    context.fill(path);
  });
  context.globalAlpha = 1;
}

export default function WorkflowGrid() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let ratio = 1;

    const render = () => {
      if (!width || !height) return;
      drawGrid(context, useWorkflowStore.getState().view, width, height, ratio);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextRatio = window.devicePixelRatio || 1;
      if (rect.width === width && rect.height === height && nextRatio === ratio)
        return;
      width = rect.width;
      height = rect.height;
      ratio = nextRatio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      render();
      canvas.dataset.ready = "";
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const unsubscribe = useWorkflowStore.subscribe((state, previous) => {
      if (state.view !== previous.view) render();
    });

    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full bg-[radial-gradient(circle,#1c1c21_1.2px,transparent_1.7px)] [background-size:10.86px_10.86px] [background-position:calc(50%-200px)_42.57px] data-ready:bg-none"
    />
  );
}
