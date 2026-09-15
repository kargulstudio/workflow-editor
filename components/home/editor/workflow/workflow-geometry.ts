import type {
  PortId,
  WorkflowEdge,
  WorkflowNode,
  WorkflowView,
} from "@/stores/workflow-store";

export type Point = { x: number; y: number };

export type OpenPort = { source: WorkflowNode; port: PortId; point: Point };

export const NODE_WIDTH = 400;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 1;
export const GRID_SIZE = 10.86;

const NODE_GAP = 80;
const BRANCH_SPREAD = 200;
const BRANCH_END = 87;
const OUT_END = 56;
const ELBOW = 40;
const CORNER = 8;
const STRAIGHT = 28;

export function estimateHeight(node: WorkflowNode) {
  return node.description.length > 56 ? 145 : 121;
}

export function nodeHeight(node: WorkflowNode, sizes: Record<string, number>) {
  return sizes[node.id] ?? estimateHeight(node);
}

export function portsOf(node: WorkflowNode): PortId[] {
  return node.kind === "branch" ? ["true", "false"] : ["out"];
}

export function hasInput(node: WorkflowNode) {
  return node.kind !== "trigger";
}

export function inputPoint(node: WorkflowNode): Point {
  return { x: node.x + NODE_WIDTH / 2, y: node.y };
}

export function outputPoint(node: WorkflowNode, height: number): Point {
  return { x: node.x + NODE_WIDTH / 2, y: node.y + height };
}

export function endpointPoint(
  node: WorkflowNode,
  height: number,
  port: PortId,
): Point {
  const origin = outputPoint(node, height);
  if (port === "true")
    return { x: origin.x - BRANCH_SPREAD, y: origin.y + BRANCH_END };
  if (port === "false")
    return { x: origin.x + BRANCH_SPREAD, y: origin.y + BRANCH_END };
  return { x: origin.x, y: origin.y + OUT_END };
}

export function openPorts(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  sizes: Record<string, number>,
): OpenPort[] {
  return nodes.flatMap((node) =>
    portsOf(node)
      .filter(
        (port) =>
          !edges.some((edge) => edge.source === node.id && edge.port === port),
      )
      .map((port) => ({
        source: node,
        port,
        point: endpointPoint(node, nodeHeight(node, sizes), port),
      })),
  );
}

export function placementFor(
  source: WorkflowNode,
  port: PortId,
  sizes: Record<string, number>,
): Point {
  const origin = outputPoint(source, nodeHeight(source, sizes));
  const offset =
    port === "true"
      ? -(BRANCH_SPREAD + 20)
      : port === "false"
        ? BRANCH_SPREAD + 20
        : 0;
  const drop = port === "out" ? NODE_GAP : NODE_GAP + ELBOW;
  return { x: origin.x + offset - NODE_WIDTH / 2, y: origin.y + drop };
}

export function freePlacement(
  point: Point,
  nodes: WorkflowNode[],
  sizes: Record<string, number>,
): Point {
  const overlaps = (candidate: Point) =>
    nodes.some(
      (node) =>
        candidate.x < node.x + NODE_WIDTH + 24 &&
        candidate.x + NODE_WIDTH + 24 > node.x &&
        candidate.y < node.y + nodeHeight(node, sizes) + 24 &&
        candidate.y + 145 > node.y,
    );
  let candidate = point;
  for (let step = 0; step < 24 && overlaps(candidate); step++) {
    candidate = { x: candidate.x + NODE_WIDTH + 40, y: candidate.y };
  }
  return candidate;
}

export function routePoints(source: Point, target: Point): Point[] {
  const drop = target.y - source.y;
  if (drop >= CORNER * 3) {
    if (Math.abs(target.x - source.x) < STRAIGHT) return [source, target];
    const elbow = source.y + Math.min(ELBOW, drop / 2);
    return [
      source,
      { x: source.x, y: elbow },
      { x: target.x, y: elbow },
      target,
    ];
  }
  const lane = Math.max(source.x, target.x) + NODE_WIDTH / 2 + ELBOW;
  const below = source.y + CORNER * 3;
  const above = target.y - CORNER * 3;
  return [
    source,
    { x: source.x, y: below },
    { x: lane, y: below },
    { x: lane, y: above },
    { x: target.x, y: above },
    target,
  ];
}

export function roundedPath(points: Point[]) {
  const [first, ...rest] = points;
  let path = `M${first.x} ${first.y}`;
  for (let index = 0; index < rest.length; index++) {
    const corner = rest[index];
    const next = rest[index + 1];
    if (!next) {
      path += ` L${corner.x} ${corner.y}`;
      break;
    }
    const previous = points[index];
    const inLength = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outLength = Math.hypot(next.x - corner.x, next.y - corner.y);
    const radius = Math.min(CORNER, inLength / 2, outLength / 2);
    if (radius < 0.5) {
      path += ` L${corner.x} ${corner.y}`;
      continue;
    }
    const inX = (corner.x - previous.x) / inLength;
    const inY = (corner.y - previous.y) / inLength;
    const outX = (next.x - corner.x) / outLength;
    const outY = (next.y - corner.y) / outLength;
    const sweep = inX * outY - inY * outX > 0 ? 1 : 0;
    path += ` L${corner.x - inX * radius} ${corner.y - inY * radius}`;
    path += ` A${radius} ${radius} 0 0 ${sweep} ${corner.x + outX * radius} ${corner.y + outY * radius}`;
  }
  return path;
}

export function labelPoint(points: Point[]): Point {
  if (points.length === 4)
    return {
      x: points[1].x + (points[2].x - points[1].x) * 0.53,
      y: points[1].y,
    };
  if (points.length === 2)
    return {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };
  const middle = Math.floor((points.length - 1) / 2);
  return {
    x: (points[middle].x + points[middle + 1].x) / 2,
    y: (points[middle].y + points[middle + 1].y) / 2,
  };
}

export function actionPoint(points: Point[]): Point {
  const last = points.at(-1)!;
  const beforeLast = points.at(-2)!;
  return { x: last.x, y: (last.y + beforeLast.y) / 2 };
}

export function toWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  view: WorkflowView,
): Point {
  return {
    x: (clientX - rect.left - rect.width / 2 - view.x) / view.zoom,
    y: (clientY - rect.top - view.y) / view.zoom,
  };
}

export function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function zoomAround(
  view: WorkflowView,
  zoom: number,
  localX: number,
  localY: number,
  width: number,
): WorkflowView {
  const next = clampZoom(zoom);
  const worldX = (localX - width / 2 - view.x) / view.zoom;
  const worldY = (localY - view.y) / view.zoom;
  return {
    zoom: next,
    x: localX - width / 2 - worldX * next,
    y: localY - worldY * next,
  };
}
