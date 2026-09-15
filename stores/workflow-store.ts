import { create } from "zustand";
import { SEED_GRAPHS, type AutomationGraph } from "@/data/automations";

export type ActionKind =
  | "trigger"
  | "send-email"
  | "update-subscription"
  | "send-webhook"
  | "wait-until"
  | "time-delay"
  | "branch"
  | "enroll";

export type PortId = "out" | "true" | "false";

export type WorkflowNode = {
  id: string;
  kind: ActionKind;
  x: number;
  y: number;
  title: string;
  description: string;
  rules?: Record<string, string>;
  fresh?: boolean;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  port: PortId;
  target: string;
};

export type WorkflowSelection = { type: "node" | "edge"; id: string } | null;

export type WorkflowView = { x: number; y: number; zoom: number };

export type InspectorTab = "build" | "status" | "logs";

export type RunStatus = "idle" | "running" | "done";

export type RunState = {
  status: RunStatus;
  activeNodeId: string | null;
  activeEdgeId: string | null;
  visited: string[];
  traversed: string[];
  startedAt: number | null;
  finishedAt: number | null;
  count: number;
};

export type RunLog = {
  id: string;
  run: number;
  nodeId: string | null;
  time: number;
  level: "info" | "success" | "warning";
  message: string;
};

type Snapshot = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };

type SavedGraph = Snapshot & {
  view: WorkflowView;
  logs: RunLog[];
  runCount: number;
};

export const DEFAULT_VIEW: WorkflowView = { x: -200, y: 48, zoom: 1 };

const IDLE_RUN: RunState = {
  status: "idle",
  activeNodeId: null,
  activeEdgeId: null,
  visited: [],
  traversed: [],
  startedAt: null,
  finishedAt: null,
  count: 0,
};

type WorkflowState = Snapshot & {
  graphId: string;
  saved: Record<string, SavedGraph>;
  view: WorkflowView;
  sizes: Record<string, number>;
  selection: WorkflowSelection;
  inspector: { nodeId: string; tab: InspectorTab } | null;
  past: Snapshot[];
  future: Snapshot[];
  run: RunState;
  logs: RunLog[];
  fitRequest: number;
  command: {
    type: "fit" | "reset" | "focus";
    nodeId?: string;
    nonce: number;
  } | null;
  sendCommand: (type: "fit" | "reset" | "focus", nodeId?: string) => void;
  setView: (update: (view: WorkflowView) => WorkflowView) => void;
  setSize: (id: string, height: number) => void;
  select: (selection: WorkflowSelection) => void;
  checkpoint: () => void;
  addNode: (
    node: WorkflowNode,
    link?: { source: string; port: PortId } | null,
  ) => void;
  moveNode: (id: string, x: number, y: number) => void;
  updateNode: (
    id: string,
    patch: Partial<
      Pick<WorkflowNode, "title" | "description" | "rules" | "kind">
    >,
  ) => void;
  changeKind: (
    id: string,
    kind: ActionKind,
    defaults: { title: string; description: string },
  ) => void;
  connect: (source: string, port: PortId, target: string) => void;
  removeNode: (id: string) => void;
  removeSelection: () => void;
  undo: () => void;
  redo: () => void;
  openInspector: (nodeId: string, tab?: InspectorTab) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  closeInspector: () => void;
  loadGraph: (id: string, fallback: () => AutomationGraph) => void;
  exportGraph: (id: string) => AutomationGraph;
  setRun: (patch: Partial<RunState>) => void;
  pushLog: (log: Omit<RunLog, "id" | "time" | "run">) => void;
  clearRun: () => void;
};

const HISTORY_LIMIT = 100;
const LOG_LIMIT = 200;

const initialGraph = SEED_GRAPHS.buzzing();

function snapshot(state: Snapshot): Snapshot {
  return { nodes: state.nodes, edges: state.edges };
}

function createId() {
  return crypto.randomUUID();
}

function settledRun(run: RunState): RunState {
  return run.status === "running" ? run : { ...IDLE_RUN, count: run.count };
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialGraph.nodes,
  edges: initialGraph.edges,
  graphId: "buzzing",
  saved: {},
  view: DEFAULT_VIEW,
  sizes: {},
  selection: null,
  inspector: null,
  past: [],
  future: [],
  run: IDLE_RUN,
  logs: [],
  fitRequest: 0,
  command: null,

  sendCommand: (type, nodeId) =>
    set((state) => ({
      command: { type, nodeId, nonce: (state.command?.nonce ?? 0) + 1 },
    })),

  setView: (update) => set((state) => ({ view: update(state.view) })),

  setSize: (id, height) => {
    if (get().sizes[id] === height) return;
    set((state) => ({ sizes: { ...state.sizes, [id]: height } }));
  },

  select: (selection) => {
    const current = get().selection;
    if (current?.id === selection?.id && current?.type === selection?.type)
      return;
    set({ selection });
  },

  checkpoint: () =>
    set((state) => ({
      past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT),
      future: [],
    })),

  addNode: (node, link) => {
    get().checkpoint();
    set((state) => ({
      nodes: [...state.nodes, node],
      edges: link
        ? [
            ...state.edges,
            {
              id: createId(),
              source: link.source,
              port: link.port,
              target: node.id,
            },
          ]
        : state.edges,
      selection: { type: "node", id: node.id },
      run: settledRun(state.run),
    }));
  },

  moveNode: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, x, y } : node,
      ),
    })),

  updateNode: (id, patch) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...patch } : node,
      ),
    })),

  changeKind: (id, kind, defaults) => {
    const node = get().nodes.find((item) => item.id === id);
    if (!node || node.kind === kind) return;
    get().checkpoint();
    set((state) => ({
      nodes: state.nodes.map((item) =>
        item.id === id
          ? { ...item, kind, rules: undefined, ...defaults }
          : item,
      ),
      edges: state.edges.map((edge) => {
        if (edge.source !== id) return edge;
        if (kind === "branch" && edge.port === "out")
          return { ...edge, port: "true" as const };
        if (kind !== "branch" && edge.port !== "out")
          return { ...edge, port: "out" as const };
        return edge;
      }),
      run: settledRun(state.run),
    }));
  },

  connect: (source, port, target) => {
    const { edges } = get();
    if (source === target) return;
    if (
      edges.some(
        (edge) =>
          edge.source === source &&
          edge.port === port &&
          edge.target === target,
      )
    )
      return;
    get().checkpoint();
    const edge = { id: createId(), source, port, target };
    set((state) => ({
      edges: [...state.edges, edge],
      selection: { type: "edge", id: edge.id },
      run: settledRun(state.run),
    }));
  },

  removeNode: (id) => {
    get().checkpoint();
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id,
      ),
      selection: state.selection?.id === id ? null : state.selection,
      inspector: state.inspector?.nodeId === id ? null : state.inspector,
      run: settledRun(state.run),
    }));
  },

  removeSelection: () => {
    const { selection } = get();
    if (!selection) return;
    if (selection.type === "node") {
      get().removeNode(selection.id);
      return;
    }
    get().checkpoint();
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== selection.id),
      selection: null,
      run: settledRun(state.run),
    }));
  },

  undo: () => {
    const { past } = get();
    const previous = past.at(-1);
    if (!previous) return;
    set((state) => ({
      ...previous,
      past: state.past.slice(0, -1),
      future: [snapshot(state), ...state.future],
      selection: null,
      inspector: previous.nodes.some(
        (node) => node.id === state.inspector?.nodeId,
      )
        ? state.inspector
        : null,
    }));
  },

  redo: () => {
    const { future } = get();
    const next = future[0];
    if (!next) return;
    set((state) => ({
      ...next,
      past: [...state.past, snapshot(state)],
      future: state.future.slice(1),
      selection: null,
      inspector: next.nodes.some((node) => node.id === state.inspector?.nodeId)
        ? state.inspector
        : null,
    }));
  },

  openInspector: (nodeId, tab) =>
    set((state) => ({
      inspector: { nodeId, tab: tab ?? state.inspector?.tab ?? "build" },
      selection: { type: "node", id: nodeId },
    })),

  setInspectorTab: (tab) =>
    set((state) => ({
      inspector: state.inspector ? { ...state.inspector, tab } : null,
    })),

  closeInspector: () => set({ inspector: null }),

  loadGraph: (id, fallback) => {
    const state = get();
    if (state.graphId === id) return;
    const current: SavedGraph = {
      nodes: state.nodes,
      edges: state.edges,
      view: state.view,
      logs: state.logs,
      runCount: state.run.count,
    };
    const next = state.saved[id];
    const graph = next ?? {
      ...fallback(),
      view: DEFAULT_VIEW,
      logs: [],
      runCount: 0,
    };
    set({
      saved: { ...state.saved, [state.graphId]: current },
      graphId: id,
      nodes: graph.nodes,
      edges: graph.edges,
      view: graph.view,
      logs: graph.logs,
      run: { ...IDLE_RUN, count: graph.runCount },
      selection: null,
      inspector: null,
      past: [],
      future: [],
      fitRequest: next ? state.fitRequest : state.fitRequest + 1,
    });
  },

  exportGraph: (id) => {
    const state = get();
    if (state.graphId === id) return snapshot(state);
    const saved = state.saved[id];
    if (saved) return { nodes: saved.nodes, edges: saved.edges };
    return SEED_GRAPHS[id]?.() ?? { nodes: [], edges: [] };
  },

  setRun: (patch) => set((state) => ({ run: { ...state.run, ...patch } })),

  pushLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        { ...log, id: createId(), time: Date.now(), run: state.run.count },
      ].slice(-LOG_LIMIT),
    })),

  clearRun: () =>
    set((state) => ({ run: { ...IDLE_RUN, count: state.run.count } })),
}));
