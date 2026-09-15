"use client";

import { useEffect, useRef } from "react";
import { useWorkflowStore, type WorkflowView } from "@/stores/workflow-store";
import { GRID_SIZE } from "./workflow-geometry";

const DOT_COLOR = "#1b1b20";
const DOT_RADIUS = 1.15;
const MIN_RADIUS = 0.75;
const LEVELS = 5;
const FADE_START = 6;
const FADE_END = 10;

const tiles = new Map<string, HTMLCanvasElement>();

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function dotTile(size: number, radius: number) {
  const key = `${size}:${radius.toFixed(2)}`;
  const cached = tiles.get(key);
  if (cached) return cached;
  if (tiles.size > 48) tiles.clear();
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const context = tile.getContext("2d")!;
  context.fillStyle = DOT_COLOR;
  context.beginPath();
  context.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  context.fill();
  tiles.set(key, tile);
  return tile;
}

function drawGrid(
  context: CanvasRenderingContext2D,
  view: WorkflowView,
  width: number,
  height: number,
  ratio: number,
) {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  const radius =
    Math.max(MIN_RADIUS, DOT_RADIUS * Math.sqrt(view.zoom)) * ratio;
  const originX = (width / 2 + view.x) * ratio;
  const originY = view.y * ratio;

  for (let level = 0; level < LEVELS; level++) {
    const spacing = GRID_SIZE * 2 ** level * view.zoom;
    const alpha = smoothstep(FADE_START, FADE_END, spacing);
    if (alpha <= 0.01 && level < LEVELS - 1) continue;

    const step = spacing * ratio;
    const size = Math.max(2, Math.round(step));
    const scale = step / size;
    const pattern = context.createPattern(
      dotTile(size, radius / scale),
      "repeat",
    );
    if (!pattern) return;
    pattern.setTransform(
      new DOMMatrix([
        scale,
        0,
        0,
        scale,
        originX - step / 2,
        originY - step / 2,
      ]),
    );
    context.globalAlpha = Math.max(alpha, level === LEVELS - 1 ? 1 : 0);
    context.fillStyle = pattern;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    if (alpha >= 0.999) break;
  }
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
