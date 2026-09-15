import { toast } from "sonner";
import {
  useWorkflowStore,
  type PortId,
  type WorkflowNode,
} from "@/stores/workflow-store";
import { ACTIONS } from "./workflow-actions";

const STEP_DURATION = 720;
const EDGE_DURATION = 420;
const MAX_STEPS = 40;
const SAMPLE_SUBSCRIBER = "maya.chen@hey.com";

let token = 0;
let clearTimer: number | null = null;

const { getState } = useWorkflowStore;

function wait(duration: number, run: number, graph: string) {
  return new Promise<boolean>((resolve) =>
    window.setTimeout(
      () => resolve(run === token && getState().graphId === graph),
      duration,
    ),
  );
}

function completion(node: WorkflowNode) {
  switch (node.kind) {
    case "trigger":
      return `${SAMPLE_SUBSCRIBER} matched “${node.title}”`;
    case "send-email":
      return `Sent “${node.title}” to ${SAMPLE_SUBSCRIBER}`;
    case "update-subscription":
      return `Applied “${node.title}” to the subscriber`;
    case "send-webhook":
      return `POST ${node.rules?.url ?? "https://hooks.buzzing.email/crm"} responded 200 OK in 184ms`;
    case "wait-until":
      return `Would wait until ${node.title} — skipped in test run`;
    case "time-delay":
      return `${node.title} — fast-forwarded in test run`;
    case "enroll":
      return `Enrolled the subscriber in “${node.title}”`;
    case "branch":
      return "Evaluated branch conditions";
  }
}

function roots() {
  const { nodes, edges } = getState();
  const triggers = nodes.filter((node) => node.kind === "trigger");
  if (triggers.length) return triggers;
  return nodes.filter((node) => !edges.some((edge) => edge.target === node.id));
}

export function stopRun() {
  token += 1;
  getState().clearRun();
}

export async function startRun() {
  const state = getState();
  if (state.run.status === "running") return;
  if (clearTimer) window.clearTimeout(clearTimer);
  const run = ++token;
  const graph = state.graphId;
  const queue = roots().map((node) => node.id);
  if (!queue.length) {
    toast("Nothing to run yet", {
      description: "Drag a trigger onto the canvas to start a workflow.",
    });
    return;
  }

  const startedAt = Date.now();
  const count = state.run.count + 1;
  state.setRun({
    status: "running",
    activeNodeId: null,
    activeEdgeId: null,
    visited: [],
    traversed: [],
    startedAt,
    finishedAt: null,
    count,
  });
  state.pushLog({
    nodeId: null,
    level: "info",
    message: `Test run #${count} started for ${SAMPLE_SUBSCRIBER}`,
  });

  const visited: string[] = [];
  const traversed: string[] = [];
  const paths: string[] = [];
  let steps = 0;

  while (queue.length && steps < MAX_STEPS) {
    const nodeId = queue.shift()!;
    const node = getState().nodes.find((item) => item.id === nodeId);
    if (!node || visited.includes(nodeId)) continue;
    steps += 1;

    getState().setRun({ activeNodeId: nodeId, activeEdgeId: null });
    getState().pushLog({
      nodeId,
      level: "info",
      message: `${ACTIONS[node.kind].label} started`,
    });
    if (!(await wait(STEP_DURATION, run, graph))) return;

    visited.push(nodeId);
    getState().setRun({ visited: [...visited] });

    const { edges } = getState();
    let port: PortId = "out";
    if (node.kind === "branch") {
      port = Math.random() < 0.6 ? "true" : "false";
      paths.push(port.toUpperCase());
      getState().pushLog({
        nodeId,
        level: "success",
        message: `Conditions evaluated → ${port.toUpperCase()} path`,
      });
    } else {
      getState().pushLog({
        nodeId,
        level: "success",
        message: completion(node),
      });
    }

    const outgoing = edges.filter(
      (edge) => edge.source === nodeId && edge.port === port,
    );
    if (node.kind === "branch" && !outgoing.length) {
      getState().pushLog({
        nodeId,
        level: "warning",
        message: `The ${port.toUpperCase()} path has no next step — the subscriber exits here`,
      });
    }

    for (const edge of outgoing) {
      getState().setRun({ activeEdgeId: edge.id, activeNodeId: null });
      if (!(await wait(EDGE_DURATION, run, graph))) return;
      traversed.push(edge.id);
      getState().setRun({ traversed: [...traversed] });
      queue.push(edge.target);
    }
  }

  const finishedAt = Date.now();
  const seconds = ((finishedAt - startedAt) / 1000).toFixed(1);
  getState().setRun({
    status: "done",
    activeNodeId: null,
    activeEdgeId: null,
    finishedAt,
  });
  getState().pushLog({
    nodeId: null,
    level: "success",
    message: `Test run #${count} finished · ${visited.length} steps in ${seconds}s`,
  });

  const lastNode = visited.at(-1);
  toast.success("Test run finished", {
    description: `${visited.length} steps in ${seconds}s${paths.length ? ` · took the ${paths.join(" → ")} path` : ""}`,
    action: lastNode
      ? {
          label: "View logs",
          onClick: () => getState().openInspector(lastNode, "logs"),
        }
      : undefined,
  });

  clearTimer = window.setTimeout(() => {
    if (run === token && getState().run.status === "done")
      getState().clearRun();
  }, 9000);
}
