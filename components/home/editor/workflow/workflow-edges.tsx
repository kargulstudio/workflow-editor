"use client";

import { Fragment } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { clsx } from "clsx";
import Button from "@/components/_ui/button";
import type {
  PortId,
  WorkflowEdge,
  WorkflowNode,
  WorkflowSelection,
} from "@/stores/workflow-store";
import ChevronDownIcon from "@/public/assets/images/home/editor/workflow/chevron-down.svg";
import { ACTIONS } from "./workflow-actions";
import {
  actionPoint,
  inputPoint,
  labelPoint,
  nodeHeight,
  openPorts,
  outputPoint,
  roundedPath,
  routePoints,
  type OpenPort,
  type Point,
} from "./workflow-geometry";

export type EdgePreview = {
  from: Point;
  to: Point;
  fromColor: string;
  toColor: string;
};

type WorkflowEdgesProps = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  sizes: Record<string, number>;
  selection: WorkflowSelection;
  snapKey: string | null;
  preview: EdgePreview | null;
  onEdgePointerDown: (id: string, event: ReactPointerEvent) => void;
  onEndpointPointerDown: (
    source: string,
    port: PortId,
    event: ReactPointerEvent,
  ) => void;
  onDeleteEdge: () => void;
};

export function portKey(source: string, port: PortId) {
  return `${source}:${port}`;
}

const labelText: Partial<Record<PortId, string>> = {
  true: "TRUE",
  false: "FALSE",
};

function positionStyle(point: Point) {
  return {
    "--point-x": `${point.x}px`,
    "--point-y": `${point.y}px`,
  } as CSSProperties;
}

function BranchLabel({ point, port }: { point: Point; port: PortId }) {
  return (
    <span
      style={positionStyle(point)}
      className="pointer-events-none absolute [top:var(--point-y)] [left:var(--point-x)] flex h-5 -translate-x-1/2 -translate-y-1/2 items-center overflow-clip rounded-[21px] bg-[#75ffd3]/15 bg-[linear-gradient(178deg,rgb(255_255_255/0.02)_3.85%,rgb(255_255_255/0.014)_28%,rgb(255_255_255/0.008)_49%,rgb(255_255_255/0)_75%)] px-[9px] text-[12px] leading-6 font-bold text-[#75ffd3] shadow-[0_1px_2px_rgb(0_0_0/0.08),0_1px_0_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)] backdrop-blur-[2px] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]"
    >
      {labelText[port]}
    </span>
  );
}

function GradientPath({
  id,
  from,
  to,
  fromColor,
  toColor,
  path,
  className,
}: {
  id: string;
  from: Point;
  to: Point;
  fromColor: string;
  toColor: string;
  path: string;
  className?: string;
}) {
  const degenerate =
    Math.abs(from.x - to.x) < 0.5 && Math.abs(from.y - to.y) < 0.5;
  return (
    <>
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1={from.x}
          y1={from.y}
          x2={degenerate ? from.x : to.x}
          y2={degenerate ? from.y + 1 : to.y}
        >
          <stop stopColor={fromColor} />
          <stop offset="1" stopColor={toColor} />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth={2}
        strokeLinecap="round"
        className={className}
      />
    </>
  );
}

export default function WorkflowEdges({
  nodes,
  edges,
  sizes,
  selection,
  snapKey,
  preview,
  onEdgePointerDown,
  onEndpointPointerDown,
  onDeleteEdge,
}: WorkflowEdgesProps) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const routed = edges.flatMap((edge) => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) return [];
    const from = outputPoint(source, nodeHeight(source, sizes));
    const to = inputPoint(target);
    const points = routePoints(from, to);
    return [
      { edge, source, target, from, to, points, path: roundedPath(points) },
    ];
  });
  const labels: { id: string; point: Point; port: PortId }[] = [];
  for (const { edge, points } of routed) {
    if (!labelText[edge.port]) continue;
    const preferred = labelPoint(points);
    const taken = labels.some(
      (label) =>
        Math.abs(label.point.x - preferred.x) < 64 &&
        Math.abs(label.point.y - preferred.y) < 24,
    );
    labels.push({
      id: edge.id,
      port: edge.port,
      point: taken ? actionPoint(points) : preferred,
    });
  }
  const open: OpenPort[] = openPorts(nodes, edges, sizes);
  const selectedEdge =
    selection?.type === "edge"
      ? routed.find((item) => item.edge.id === selection.id)
      : undefined;

  return (
    <>
      <svg
        aria-hidden
        width="1"
        height="1"
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
      >
        {routed.map(({ edge, source, target, from, to, path }) => {
          const selected =
            selection?.type === "edge" && selection.id === edge.id;
          return (
            <g key={edge.id} className="group/edge">
              <GradientPath
                id={`edge-${edge.id}`}
                from={from}
                to={to}
                fromColor={ACTIONS[source.kind].accent}
                toColor={ACTIONS[target.kind].accent}
                path={path}
                className={clsx(
                  "ease-power3-in-out transition-opacity duration-150",
                  selected
                    ? "opacity-100"
                    : "opacity-40 group-hover/edge:opacity-70",
                )}
              />
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                onPointerDown={(event) => onEdgePointerDown(edge.id, event)}
                className="[pointer-events:stroke] cursor-pointer"
              />
            </g>
          );
        })}
        {open.map(({ source, port, point }) => {
          if (snapKey === portKey(source.id, port)) return null;
          const from = outputPoint(source, nodeHeight(source, sizes));
          return (
            <GradientPath
              key={portKey(source.id, port)}
              id={`stub-${source.id}-${port}`}
              from={from}
              to={point}
              fromColor={ACTIONS[source.kind].accent}
              toColor="#ffffff"
              path={roundedPath(routePoints(from, point))}
              className="opacity-40"
            />
          );
        })}
        {preview && (
          <GradientPath
            id="edge-preview"
            from={preview.from}
            to={preview.to}
            fromColor={preview.fromColor}
            toColor={preview.toColor}
            path={roundedPath(routePoints(preview.from, preview.to))}
            className="opacity-70"
          />
        )}
      </svg>

      {labels.map(({ id, point, port }) => (
        <BranchLabel key={id} point={point} port={port} />
      ))}

      {open.map(({ source, port, point }) => {
        const key = portKey(source.id, port);
        const from = outputPoint(source, nodeHeight(source, sizes));
        const snapped = snapKey === key;
        return (
          <Fragment key={key}>
            {labelText[port] && (
              <BranchLabel
                point={labelPoint(routePoints(from, point))}
                port={port}
              />
            )}
            <span
              role="presentation"
              data-snapped={snapped || undefined}
              style={positionStyle(point)}
              onPointerDown={(event) =>
                onEndpointPointerDown(source.id, port, event)
              }
              className="ease-power3-in-out absolute [top:var(--point-y)] [left:var(--point-x)] flex size-3 -translate-x-1/2 -translate-y-1/2 cursor-crosshair items-center justify-center rounded-full bg-white text-black shadow-[0_0_0_3px_rgb(255_255_255/0.3),0_0_4px_3px_rgb(0_0_0/0.25)] transition-[box-shadow] duration-150 before:absolute before:-inset-2 before:rounded-full hover:shadow-[0_0_0_5px_rgb(255_255_255/0.4),0_0_4px_5px_rgb(0_0_0/0.25)] data-snapped:shadow-[0_0_0_7px_rgb(255_255_255/0.45),0_0_4px_7px_rgb(0_0_0/0.25)]"
            >
              <ChevronDownIcon aria-hidden className="size-2.5" />
            </span>
          </Fragment>
        );
      })}

      {selectedEdge && (
        <div
          style={positionStyle(actionPoint(selectedEdge.points))}
          onPointerDown={(event) => event.stopPropagation()}
          className="ease-power3-out absolute [top:var(--point-y)] [left:var(--point-x)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 starting:opacity-0"
        >
          <Button variant="field" size="xs" onClick={onDeleteEdge}>
            Delete
          </Button>
        </div>
      )}
    </>
  );
}
