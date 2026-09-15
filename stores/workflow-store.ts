import { create } from "zustand";

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

type Snapshot = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };

type WorkflowState = Snapshot & {
  view: WorkflowView;
  sizes: Record<string, number>;
  selection: WorkflowSelection;
  past: Snapshot[];
  future: Snapshot[];
  setView: (update: (view: WorkflowView) => WorkflowView) => void;
  setSize: (id: string, height: number) => void;
  select: (selection: WorkflowSelection) => void;
  checkpoint: () => void;
  addNode: (
    node: WorkflowNode,
    link?: { source: string; port: PortId } | null,
  ) => void;
  moveNode: (id: string, x: number, y: number) => void;
  connect: (source: string, port: PortId, target: string) => void;
  removeSelection: () => void;
  undo: () => void;
  redo: () => void;
};

const HISTORY_LIMIT = 100;

const initialNodes: WorkflowNode[] = [
  {
    id: "trigger",
    kind: "trigger",
    x: 0,
    y: 0,
    title: "Signed Up",
    description: "Triggered when a new subscriber signs up for your newsletter",
  },
  {
    id: "wait",
    kind: "wait-until",
    x: 0,
    y: 225,
    title: "Monday at 9:00 AM",
    description: "Ensures the welcome email is sent at an optimal time.",
  },
  {
    id: "branch",
    kind: "branch",
    x: 0,
    y: 426,
    title: "Branch on 0 conditions",
    description: "Need to add a condition, e.g., Opened Email 1 = True",
  },
];

const initialEdges: WorkflowEdge[] = [
  { id: "trigger-wait", source: "trigger", port: "out", target: "wait" },
  { id: "wait-branch", source: "wait", port: "out", target: "branch" },
];

function snapshot(state: Snapshot): Snapshot {
  return { nodes: state.nodes, edges: state.edges };
}

function createId() {
  return crypto.randomUUID();
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  view: { x: -200, y: 48, zoom: 1 },
  sizes: {},
  selection: null,
  past: [],
  future: [],

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
    }));
  },

  moveNode: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, x, y } : node,
      ),
    })),

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
    }));
  },

  removeSelection: () => {
    const { selection } = get();
    if (!selection) return;
    get().checkpoint();
    if (selection.type === "edge") {
      set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== selection.id),
        selection: null,
      }));
      return;
    }
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== selection.id),
      edges: state.edges.filter(
        (edge) => edge.source !== selection.id && edge.target !== selection.id,
      ),
      selection: null,
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
    }));
  },
}));
