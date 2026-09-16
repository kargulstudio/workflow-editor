import { create } from "zustand";
import {
  SEED_GRAPHS,
  blankGraph,
  seedAutomations,
  type Automation,
  type AutomationStatus,
} from "@/data/automations";
import { useWorkflowStore } from "@/stores/workflow-store";

export type Screen = "dashboard" | "automations" | "editor";

export type EditorTab = "overview" | "workflow" | "settings" | "export";

export type AutomationSettings = {
  senderName: string;
  replyTo: string;
  quietHours: boolean;
  quietFrom: string;
  quietTo: string;
  timezone: string;
  reentry: boolean;
  exitOnUnsubscribe: boolean;
  skipWeekends: boolean;
  goal: string;
  shareLink: boolean;
};

type AppState = {
  screen: Screen;
  tab: EditorTab;
  automationId: string;
  automations: Automation[];
  settings: Record<string, AutomationSettings>;
  sidebarOpen: boolean;
  renameRequest: number;
  openScreen: (screen: Screen) => void;
  openAutomation: (id: string, tab?: EditorTab) => void;
  setTab: (tab: EditorTab) => void;
  toggleSidebar: () => void;
  createAutomation: () => void;
  updateAutomation: (
    id: string,
    patch: Partial<Pick<Automation, "name" | "description" | "status">>,
  ) => void;
  duplicateAutomation: (id: string) => void;
  deleteAutomation: (id: string) => void;
  updateSettings: (id: string, patch: Partial<AutomationSettings>) => void;
};

export const DEFAULT_SETTINGS: AutomationSettings = {
  senderName: "Marcel from Buzzing",
  replyTo: "hello@buzzing.email",
  quietHours: true,
  quietFrom: "21:00",
  quietTo: "08:00",
  timezone: "Subscriber’s timezone",
  reentry: false,
  exitOnUnsubscribe: true,
  skipWeekends: false,
  goal: "Opens the first lesson",
  shareLink: false,
};

export const STATUS_LABEL: Record<AutomationStatus, string> = {
  draft: "Draft",
  running: "Running",
  paused: "Paused",
};

function touch(automation: Automation): Automation {
  return { ...automation, updatedAt: Date.now() };
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: "editor",
  tab: "workflow",
  automationId: "buzzing",
  automations: seedAutomations(Date.now()),
  settings: {},
  sidebarOpen: false,
  renameRequest: 0,

  openScreen: (screen) => set({ screen }),

  openAutomation: (id, tab = "workflow") => {
    useWorkflowStore
      .getState()
      .loadGraph(id, SEED_GRAPHS[id] ?? (() => blankGraph(id)));
    set({ screen: "editor", automationId: id, tab });
  },

  setTab: (tab) => set({ tab }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  createAutomation: () => {
    const id = `automation-${crypto.randomUUID().slice(0, 8)}`;
    const now = Date.now();
    set((state) => ({
      automations: [
        {
          id,
          name: "Untitled automation",
          description: "Describe what this automation does",
          status: "draft",
          category: "welcome",
          enrolled: 0,
          completed: 0,
          createdAt: now,
          updatedAt: now,
        },
        ...state.automations,
      ],
    }));
    useWorkflowStore.getState().loadGraph(id, () => blankGraph(id));
    set((state) => ({
      screen: "editor",
      automationId: id,
      tab: "workflow",
      renameRequest: state.renameRequest + 1,
    }));
  },

  updateAutomation: (id, patch) =>
    set((state) => ({
      automations: state.automations.map((automation) =>
        automation.id === id ? touch({ ...automation, ...patch }) : automation,
      ),
    })),

  duplicateAutomation: (id) => {
    const source = get().automations.find((automation) => automation.id === id);
    if (!source) return;
    const copyId = `automation-${crypto.randomUUID().slice(0, 8)}`;
    const graph = useWorkflowStore.getState().exportGraph(id);
    const now = Date.now();
    set((state) => ({
      automations: [
        {
          ...source,
          id: copyId,
          name: `${source.name} (copy)`,
          status: "draft",
          enrolled: 0,
          completed: 0,
          createdAt: now,
          updatedAt: now,
        },
        ...state.automations,
      ],
      settings: state.settings[id]
        ? { ...state.settings, [copyId]: state.settings[id] }
        : state.settings,
    }));
    const suffix = copyId.slice(-8);
    useWorkflowStore.getState().loadGraph(copyId, () => ({
      nodes: graph.nodes.map((node) => ({
        ...node,
        id: `${node.id}-${suffix}`,
        fresh: false,
      })),
      edges: graph.edges.map((edge) => ({
        ...edge,
        id: `${edge.id}-${suffix}`,
        source: `${edge.source}-${suffix}`,
        target: `${edge.target}-${suffix}`,
      })),
    }));
    set({ screen: "editor", automationId: copyId, tab: "workflow" });
  },

  deleteAutomation: (id) => {
    const remaining = get().automations.filter(
      (automation) => automation.id !== id,
    );
    set({ automations: remaining, screen: "automations" });
    const fallback = remaining[0];
    if (fallback && get().automationId === id) {
      useWorkflowStore
        .getState()
        .loadGraph(
          fallback.id,
          SEED_GRAPHS[fallback.id] ?? (() => blankGraph(fallback.id)),
        );
      set({ automationId: fallback.id });
    }
  },

  updateSettings: (id, patch) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [id]: { ...(state.settings[id] ?? DEFAULT_SETTINGS), ...patch },
      },
      automations: state.automations.map((automation) =>
        automation.id === id ? touch(automation) : automation,
      ),
    })),
}));
