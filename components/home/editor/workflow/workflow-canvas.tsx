"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { clsx } from "clsx";
import { animate, type AnimationPlaybackControls } from "motion";
import { ease } from "@/lib/easings";
import {
  useWorkflowStore,
  type ActionKind,
  type PortId,
  type WorkflowNode as WorkflowNodeData,
  type WorkflowView,
  DEFAULT_VIEW,
} from "@/stores/workflow-store";
import ActionsPanel from "./actions-panel/actions-panel";
import WorkflowNode from "./workflow-node";
import WorkflowEdges, { portKey, type EdgePreview } from "./workflow-edges";
import WorkflowControls from "./workflow-controls";
import WorkflowGhost from "./workflow-ghost";
import WorkflowGrid from "./workflow-grid";
import NodePanel from "./node-panel/node-panel";
import { ACTIONS } from "./workflow-actions";
import {
  MAX_ZOOM,
  MIN_ZOOM,
  NODE_WIDTH,
  clampZoom,
  estimateHeight,
  freePlacement,
  hasInput,
  inputPoint,
  nodeHeight,
  openPorts,
  outputPoint,
  placementFor,
  snapToNodes,
  toWorld,
  zoomAround,
  type OpenPort,
  type Point,
} from "./workflow-geometry";

type PaletteDrag = {
  kind: ActionKind;
  clientX: number;
  clientY: number;
  grabX: number;
  grabY: number;
  snap: OpenPort | null;
  placement: Point | null;
};

type LinkDrag = {
  source: string;
  port: PortId | null;
  pointer: Point;
  target: string | null;
};

type PointerEnd = (event: PointerEvent, cancelled: boolean) => void;

const VIEW_DURATION = 0.25;
const SNAP_RADIUS = 48;
const DRAG_THRESHOLD = 4;
const ZOOM_STEP = 1.25;
const PANEL_INSET = 352;
const SNAP_TOLERANCE = 10;

const COMPACT_QUERY = "(max-width: 639px)";

function subscribeCompact(onChange: () => void) {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function isCompact() {
  return window.matchMedia(COMPACT_QUERY).matches;
}
const INSPECTOR_INSET = 512;

const { getState } = useWorkflowStore;

let handledFitRequest = 0;

function trackPointer(
  onMove: (event: PointerEvent) => void,
  onEnd: PointerEnd,
) {
  const handleUp = (event: PointerEvent) => {
    stop();
    onEnd(event, false);
  };
  const handleCancel = (event: PointerEvent) => {
    stop();
    onEnd(event, true);
  };
  function stop() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", handleUp);
    window.removeEventListener("pointercancel", handleCancel);
  }
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", handleUp);
  window.addEventListener("pointercancel", handleCancel);
  return stop;
}

function findSnap(world: Point, zoom: number) {
  const { nodes, edges, sizes } = getState();
  let best: { port: OpenPort; placement: Point } | null = null;
  let bestDistance = Infinity;
  for (const port of openPorts(nodes, edges, sizes)) {
    const placement = placementFor(port.source, port.port, sizes);
    const distance =
      Math.hypot(world.x - port.point.x, world.y - port.point.y) * zoom;
    const inside =
      world.x >= placement.x &&
      world.x <= placement.x + NODE_WIDTH &&
      world.y >= port.point.y - 12 &&
      world.y <= placement.y + 121;
    if ((distance <= SNAP_RADIUS || inside) && distance < bestDistance) {
      best = { port, placement: freePlacement(placement, nodes, sizes) };
      bestDistance = distance;
    }
  }
  return best;
}

function nodeAt(world: Point, exclude: string) {
  const { nodes, sizes } = getState();
  for (let index = nodes.length - 1; index >= 0; index--) {
    const node = nodes[index];
    if (node.id === exclude || !hasInput(node)) continue;
    const height = nodeHeight(node, sizes);
    if (
      world.x >= node.x &&
      world.x <= node.x + NODE_WIDTH &&
      world.y >= node.y - 16 &&
      world.y <= node.y + height
    )
      return node.id;
  }
  return null;
}

function resolvePort(link: LinkDrag): PortId {
  if (link.port) return link.port;
  const source = getState().nodes.find((node) => node.id === link.source);
  if (source?.kind !== "branch") return "out";
  return link.pointer.x < source.x + NODE_WIDTH / 2 ? "true" : "false";
}

export default function WorkflowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const stopTrackingRef = useRef<(() => void) | null>(null);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const sizes = useWorkflowStore((state) => state.sizes);
  const selection = useWorkflowStore((state) => state.selection);
  const view = useWorkflowStore((state) => state.view);
  const setView = useWorkflowStore((state) => state.setView);
  const setSize = useWorkflowStore((state) => state.setSize);
  const select = useWorkflowStore((state) => state.select);
  const removeSelection = useWorkflowStore((state) => state.removeSelection);
  const run = useWorkflowStore((state) => state.run);
  const inspectorNodeId = useWorkflowStore(
    (state) => state.inspector?.nodeId ?? null,
  );

  const compact = useSyncExternalStore(subscribeCompact, isCompact, () => false);
  const [panelOverride, setPanelOverride] = useState<boolean | null>(null);
  const panelOpen = panelOverride ?? !compact;
  const [palette, setPalette] = useState<PaletteDrag | null>(null);
  const [link, setLink] = useState<LinkDrag | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);

  const bounds = useCallback(
    () => containerRef.current!.getBoundingClientRect(),
    [],
  );

  const track = useCallback(
    (onMove: (event: PointerEvent) => void, onEnd: PointerEnd) => {
      stopTrackingRef.current?.();
      stopTrackingRef.current = trackPointer(onMove, (event, cancelled) => {
        stopTrackingRef.current = null;
        onEnd(event, cancelled);
      });
    },
    [],
  );

  const stopAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  const animateView = useCallback(
    (update: (view: WorkflowView) => WorkflowView) => {
      stopAnimation();
      const from = getState().view;
      const to = update(from);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setView(() => to);
        return;
      }
      animationRef.current = animate(0, 1, {
        duration: VIEW_DURATION,
        ease: ease.power3InOut,
        onUpdate: (progress) =>
          setView(() => ({
            x: from.x + (to.x - from.x) * progress,
            y: from.y + (to.y - from.y) * progress,
            zoom: from.zoom + (to.zoom - from.zoom) * progress,
          })),
        onComplete: () => {
          animationRef.current = null;
        },
      });
    },
    [setView, stopAnimation],
  );

  const cancelInteraction = useCallback(() => {
    stopTrackingRef.current?.();
    stopTrackingRef.current = null;
    setPalette(null);
    setLink(null);
    setDraggingNode(null);
    setPanning(false);
  }, []);

  useEffect(
    () => () => {
      stopTrackingRef.current?.();
      animationRef.current?.stop();
    },
    [],
  );

  const reveal = useCallback(
    (node: WorkflowNodeData) => {
      const rect = bounds();
      const current = getState().view;
      const height = estimateHeight(node);
      const inset = panelOpen && rect.width >= 900 ? PANEL_INSET : 16;
      const right =
        getState().inspector && rect.width >= 1100 ? INSPECTOR_INSET : 16;
      const left = rect.width / 2 + current.x + node.x * current.zoom;
      const top = current.y + node.y * current.zoom;
      const visible =
        left >= inset &&
        left + NODE_WIDTH * current.zoom <= rect.width - right &&
        top >= 16 &&
        top + height * current.zoom <= rect.height - 16;
      if (visible) return;
      const centerX = inset + (rect.width - inset - right) / 2;
      animateView((value) => ({
        ...value,
        x: centerX - rect.width / 2 - (node.x + NODE_WIDTH / 2) * value.zoom,
        y: rect.height / 2 - (node.y + height / 2) * value.zoom,
      }));
    },
    [animateView, bounds, panelOpen],
  );

  const createNode = useCallback(
    (
      kind: ActionKind,
      position: Point,
      source: { source: string; port: PortId } | null,
    ) => {
      const action = ACTIONS[kind];
      const node: WorkflowNodeData = {
        id: crypto.randomUUID(),
        kind,
        x: Math.round(position.x),
        y: Math.round(position.y),
        title: action.title,
        description: action.description,
        fresh: true,
      };
      getState().addNode(node, source);
      return node;
    },
    [],
  );

  const addToNextSlot = useCallback(
    (kind: ActionKind) => {
      const state = getState();
      const ports = openPorts(state.nodes, state.edges, state.sizes);
      const preferred =
        ports.find(
          (port) =>
            state.selection?.type === "node" &&
            port.source.id === state.selection.id,
        ) ?? ports[0];
      if (preferred) {
        const node = createNode(
          kind,
          freePlacement(
            placementFor(preferred.source, preferred.port, state.sizes),
            state.nodes,
            state.sizes,
          ),
          { source: preferred.source.id, port: preferred.port },
        );
        reveal(node);
        return;
      }
      const rect = bounds();
      const center = toWorld(
        rect.left + rect.width / 2,
        rect.top + rect.height / 3,
        rect,
        state.view,
      );
      const node = createNode(
        kind,
        freePlacement(
          { x: center.x - NODE_WIDTH / 2, y: center.y },
          state.nodes,
          state.sizes,
        ),
        null,
      );
      reveal(node);
    },
    [bounds, createNode, reveal],
  );

  const resolvePalette = useCallback(
    (
      kind: ActionKind,
      clientX: number,
      clientY: number,
      grabX: number,
      grabY: number,
    ): PaletteDrag => {
      const base = {
        kind,
        clientX,
        clientY,
        grabX,
        grabY,
        snap: null,
        placement: null,
      };
      const rect = bounds();
      const panel = panelRef.current?.getBoundingClientRect();
      const overPanel =
        panel &&
        clientX >= panel.left &&
        clientX <= panel.right &&
        clientY >= panel.top &&
        clientY <= panel.bottom;
      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
      if (overPanel || !inside) return base;
      const current = getState().view;
      const world = toWorld(clientX, clientY, rect, current);
      const snap = findSnap(world, current.zoom);
      if (snap) return { ...base, snap: snap.port, placement: snap.placement };
      return {
        ...base,
        placement: { x: world.x - NODE_WIDTH / 2, y: world.y - 18 },
      };
    },
    [bounds],
  );

  const handleItemPointerDown = useCallback(
    (kind: ActionKind, event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      const item = event.currentTarget.getBoundingClientRect();
      const grabX = event.clientX - item.left;
      const grabY = event.clientY - item.top;
      const startX = event.clientX;
      const startY = event.clientY;
      let active = false;
      track(
        (move) => {
          if (
            !active &&
            Math.hypot(move.clientX - startX, move.clientY - startY) <
              DRAG_THRESHOLD
          )
            return;
          active = true;
          setPalette(
            resolvePalette(kind, move.clientX, move.clientY, grabX, grabY),
          );
        },
        (end, cancelled) => {
          setPalette(null);
          if (cancelled) return;
          if (!active) {
            addToNextSlot(kind);
            return;
          }
          const drop = resolvePalette(
            kind,
            end.clientX,
            end.clientY,
            grabX,
            grabY,
          );
          if (!drop.placement) return;
          createNode(
            kind,
            drop.placement,
            drop.snap
              ? { source: drop.snap.source.id, port: drop.snap.port }
              : null,
          );
        },
      );
    },
    [addToNextSlot, createNode, resolvePalette, track],
  );

  const handleNodePointerDown = useCallback(
    (id: string, event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      const state = getState();
      state.select({ type: "node", id });
      const node = state.nodes.find((item) => item.id === id);
      if (!node) return;
      const zoom = state.view.zoom;
      const startX = event.clientX;
      const startY = event.clientY;
      let active = false;
      track(
        (move) => {
          const deltaX = move.clientX - startX;
          const deltaY = move.clientY - startY;
          if (!active) {
            if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;
            active = true;
            getState().checkpoint();
            setDraggingNode(id);
          }
          const current = getState();
          const moving = {
            x: node.x + deltaX / zoom,
            y: node.y + deltaY / zoom,
            width: NODE_WIDTH,
            height: nodeHeight(node, current.sizes),
          };
          const others = current.nodes
            .filter((item) => item.id !== id)
            .map((item) => ({
              x: item.x,
              y: item.y,
              width: NODE_WIDTH,
              height: nodeHeight(item, current.sizes),
            }));
          const snapped = snapToNodes(moving, others, SNAP_TOLERANCE / zoom);
          current.moveNode(id, Math.round(snapped.x), Math.round(snapped.y));
        },
        () => setDraggingNode(null),
      );
    },
    [track],
  );

  const startLink = useCallback(
    (source: string, port: PortId | null, event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      const measure = (clientX: number, clientY: number): LinkDrag => {
        const pointer = toWorld(clientX, clientY, bounds(), getState().view);
        return { source, port, pointer, target: nodeAt(pointer, source) };
      };
      setLink(measure(event.clientX, event.clientY));
      track(
        (move) => setLink(measure(move.clientX, move.clientY)),
        (end, cancelled) => {
          setLink(null);
          if (cancelled) return;
          const result = measure(end.clientX, end.clientY);
          if (!result.target) return;
          getState().connect(source, resolvePort(result), result.target);
        },
      );
    },
    [bounds, track],
  );

  const handleHandlePointerDown = useCallback(
    (id: string, event: ReactPointerEvent) => startLink(id, null, event),
    [startLink],
  );

  const handleEndpointPointerDown = useCallback(
    (source: string, port: PortId, event: ReactPointerEvent) =>
      startLink(source, port, event),
    [startLink],
  );

  const handleEdgePointerDown = useCallback(
    (id: string, event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      getState().select({ type: "edge", id });
    },
    [],
  );

  const handleCanvasPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0 && event.button !== 1) return;
    stopAnimation();
    const start = getState().view;
    const startX = event.clientX;
    const startY = event.clientY;
    let active = false;
    track(
      (move) => {
        const deltaX = move.clientX - startX;
        const deltaY = move.clientY - startY;
        if (!active) {
          if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;
          active = true;
          setPanning(true);
        }
        setView(() => ({ ...start, x: start.x + deltaX, y: start.y + deltaY }));
      },
      () => {
        setPanning(false);
        if (!active) select(null);
      },
    );
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-canvas-overlay]")
      )
        return;
      event.preventDefault();
      stopAnimation();
      const scale = event.deltaMode === 1 ? 16 : 1;
      const rect = element.getBoundingClientRect();
      if (event.ctrlKey || event.metaKey) {
        const factor = Math.exp(-event.deltaY * scale * 0.01);
        setView((current) =>
          zoomAround(
            current,
            current.zoom * factor,
            event.clientX - rect.left,
            event.clientY - rect.top,
            rect.width,
          ),
        );
        return;
      }
      setView((current) => ({
        ...current,
        x: current.x - event.deltaX * scale,
        y: current.y - event.deltaY * scale,
      }));
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [setView, stopAnimation]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, select, [contenteditable='true']")
      )
        return;
      const state = getState();
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && (key === "z" || key === "y")) {
        event.preventDefault();
        if (key === "y" || event.shiftKey) state.redo();
        else state.undo();
        return;
      }
      if ((key === "delete" || key === "backspace") && state.selection) {
        event.preventDefault();
        state.removeSelection();
        return;
      }
      if (key === "escape") {
        cancelInteraction();
        if (state.inspector) state.closeInspector();
        else state.select(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancelInteraction]);

  const zoomBy = (factor: number) => {
    const rect = bounds();
    animateView((current) =>
      zoomAround(
        current,
        current.zoom * factor,
        rect.width / 2,
        rect.height / 2,
        rect.width,
      ),
    );
  };

  const fitView = useCallback(
    (options: { animate?: boolean; onlyIfNeeded?: boolean } = {}) => {
      const state = getState();
      if (!state.nodes.length) return;
      const rect = bounds();
      const minX = Math.min(...state.nodes.map((node) => node.x)) - 40;
      const maxX =
        Math.max(...state.nodes.map((node) => node.x + NODE_WIDTH)) + 40;
      const minY = Math.min(...state.nodes.map((node) => node.y)) - 24;
      const maxY =
        Math.max(
          ...state.nodes.map((node) => node.y + nodeHeight(node, state.sizes)),
        ) + 104;
      const inset = panelOpen && rect.width >= 900 ? PANEL_INSET : 0;
      const zoom = clampZoom(
        Math.min(
          (rect.width - inset - 64) / (maxX - minX),
          (rect.height - 64) / (maxY - minY),
        ),
      );
      const centerX = inset + (rect.width - inset) / 2;
      const fits =
        maxX - minX <= rect.width - inset - 64 &&
        maxY - minY <= rect.height - 64;
      if (options.onlyIfNeeded && fits) {
        setView(() => DEFAULT_VIEW);
        return;
      }
      const target = {
        zoom,
        x: centerX - rect.width / 2 - ((minX + maxX) / 2) * zoom,
        y: fits ? DEFAULT_VIEW.y : rect.height / 2 - ((minY + maxY) / 2) * zoom,
      };
      if (options.animate === false) setView(() => target);
      else animateView(() => target);
    },
    [animateView, bounds, panelOpen, setView],
  );

  const fittedCompact = useRef(false);
  useEffect(() => {
    if (!compact || fittedCompact.current) return;
    fittedCompact.current = true;
    const frame = requestAnimationFrame(() => fitView({ animate: false }));
    return () => cancelAnimationFrame(frame);
  }, [compact, fitView]);

  const fitRequest = useWorkflowStore((state) => state.fitRequest);

  useEffect(() => {
    if (handledFitRequest === fitRequest) return;
    handledFitRequest = fitRequest;
    fitView({ animate: false, onlyIfNeeded: true });
  }, [fitRequest, fitView]);

  const appendTo = useCallback(
    (sourceId: string, kind: ActionKind) => {
      const state = getState();
      const source = state.nodes.find((node) => node.id === sourceId);
      if (!source) return;
      const port =
        openPorts(state.nodes, state.edges, state.sizes).find(
          (item) => item.source.id === sourceId,
        )?.port ?? (source.kind === "branch" ? "true" : "out");
      const node = createNode(
        kind,
        freePlacement(
          placementFor(source, port, state.sizes),
          state.nodes,
          state.sizes,
        ),
        { source: sourceId, port },
      );
      getState().openInspector(node.id, "build");
      reveal(node);
    },
    [createNode, reveal],
  );

  const focusNode = useCallback(
    (id: string) => {
      const node = getState().nodes.find((item) => item.id === id);
      if (node) reveal(node);
    },
    [reveal],
  );

  const command = useWorkflowStore((state) => state.command);
  const handledCommand = useRef(command?.nonce ?? 0);

  useEffect(() => {
    if (!command || handledCommand.current === command.nonce) return;
    handledCommand.current = command.nonce;
    if (command.type === "fit") fitView();
    if (command.type === "reset") {
      const rect = bounds();
      animateView((current) =>
        zoomAround(current, 1, rect.width / 2, rect.height / 3, rect.width),
      );
    }
    if (command.type === "focus" && command.nodeId) focusNode(command.nodeId);
  }, [animateView, bounds, command, fitView, focusNode]);

  const openNode = useCallback(
    (id: string) => {
      getState().openInspector(id);
      focusNode(id);
    },
    [focusNode],
  );

  const snapKey = palette?.snap
    ? portKey(palette.snap.source.id, palette.snap.port)
    : null;

  let preview: EdgePreview | null = null;
  const linkSource = link && nodes.find((node) => node.id === link.source);
  if (link && linkSource) {
    const target = link.target
      ? nodes.find((node) => node.id === link.target)
      : undefined;
    preview = {
      from: outputPoint(linkSource, nodeHeight(linkSource, sizes)),
      to: target ? inputPoint(target) : link.pointer,
      fromColor: ACTIONS[linkSource.kind].accent,
      toColor: target ? ACTIONS[target.kind].accent : "#ffffff",
    };
  } else if (palette?.snap && palette.placement) {
    const source = palette.snap.source;
    preview = {
      from: outputPoint(source, nodeHeight(source, sizes)),
      to: { x: palette.placement.x + NODE_WIDTH / 2, y: palette.placement.y },
      fromColor: ACTIONS[source.kind].accent,
      toColor: ACTIONS[palette.kind].accent,
    };
  }

  const canvasStyle = {
    "--view-x": `${view.x}px`,
    "--view-y": `${view.y}px`,
    "--view-zoom": view.zoom,
  } as CSSProperties;

  const interacting = Boolean(palette || link || draggingNode || panning);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-roledescription="workflow canvas"
      aria-label="Workflow canvas"
      style={canvasStyle}
      onPointerDown={handleCanvasPointerDown}
      className="relative min-h-0 flex-1 touch-none overflow-hidden bg-[#0e0e12] select-none"
    >
      <WorkflowGrid />

      <div className="absolute top-0 left-1/2 origin-top-left [transform:translate(var(--view-x),var(--view-y))_scale(var(--view-zoom))]">
        <WorkflowEdges
          nodes={nodes}
          edges={edges}
          sizes={sizes}
          selection={selection}
          snapKey={snapKey}
          preview={preview}
          activeEdgeId={run.activeEdgeId}
          traversed={run.traversed}
          onEdgePointerDown={handleEdgePointerDown}
          onEndpointPointerDown={handleEndpointPointerDown}
          onDeleteEdge={removeSelection}
        />

        {palette?.snap && palette.placement && (
          <div
            key={snapKey}
            aria-hidden
            style={
              {
                "--node-x": `${palette.placement.x}px`,
                "--node-y": `${palette.placement.y}px`,
              } as CSSProperties
            }
            className={clsx(
              ACTIONS[palette.kind].theme,
              "ease-power3-out pointer-events-none absolute top-0 left-0 h-[121px] w-[400px] [translate:var(--node-x)_var(--node-y)] rounded-[12px] border border-dashed border-(--accent)/40 bg-(--accent)/5 transition-opacity duration-150 motion-reduce:transition-none starting:opacity-0",
            )}
          />
        )}

        {nodes.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            selected={selection?.type === "node" && selection.id === node.id}
            targeted={link?.target === node.id}
            dragging={draggingNode === node.id}
            runState={
              run.activeNodeId === node.id
                ? "active"
                : run.visited.includes(node.id)
                  ? "done"
                  : "idle"
            }
            onMeasure={setSize}
            onNodePointerDown={handleNodePointerDown}
            onHandlePointerDown={handleHandlePointerDown}
            onOpen={openNode}
            editing={inspectorNodeId === node.id}
          />
        ))}
      </div>

      <ActionsPanel
        ref={panelRef}
        open={panelOpen}
        draggingKind={palette?.kind ?? null}
        onToggle={() => setPanelOverride(!panelOpen)}
        onItemPointerDown={handleItemPointerDown}
        onAdd={addToNextSlot}
      />

      <NodePanel onFocusNode={focusNode} onAppend={appendTo} />

      <WorkflowControls
        canZoomIn={view.zoom < MAX_ZOOM - 0.001}
        canZoomOut={view.zoom > MIN_ZOOM + 0.001}
        onZoomIn={() => zoomBy(ZOOM_STEP)}
        onZoomOut={() => zoomBy(1 / ZOOM_STEP)}
        onFitView={() => fitView()}
      />

      {interacting && (
        <div
          aria-hidden
          className={clsx(
            "fixed inset-0 z-40",
            link ? "cursor-crosshair" : "cursor-grabbing",
          )}
        />
      )}

      {palette && (
        <WorkflowGhost
          kind={palette.kind}
          x={palette.clientX - palette.grabX}
          y={palette.clientY - palette.grabY}
          snapped={Boolean(palette.snap)}
        />
      )}
    </div>
  );
}
