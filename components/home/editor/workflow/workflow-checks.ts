import type { WorkflowEdge, WorkflowNode } from "@/stores/workflow-store";

export type WorkflowIssue = {
  id: string;
  nodeId: string | null;
  title: string;
  detail: string;
};

export function workflowIssues(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): WorkflowIssue[] {
  const issues: WorkflowIssue[] = [];
  const incoming = new Set(edges.map((edge) => edge.target));
  const outgoing = new Map<string, Set<string>>();
  for (const edge of edges) {
    const ports = outgoing.get(edge.source) ?? new Set<string>();
    ports.add(edge.port);
    outgoing.set(edge.source, ports);
  }

  const triggers = nodes.filter((node) => node.kind === "trigger");
  if (nodes.length && !triggers.length) {
    issues.push({
      id: "no-trigger",
      nodeId: null,
      title: "No trigger step",
      detail: "Nothing lets subscribers into this automation.",
    });
  }

  for (const node of nodes) {
    const ports = outgoing.get(node.id);
    if (node.kind !== "trigger" && !incoming.has(node.id)) {
      issues.push({
        id: `orphan-${node.id}`,
        nodeId: node.id,
        title: `${node.title} isn’t connected`,
        detail: "No step leads into it, so it will never run.",
      });
    }
    if (node.kind === "branch") {
      if (!ports?.has("true")) {
        issues.push({
          id: `true-${node.id}`,
          nodeId: node.id,
          title: `${node.title} has no TRUE path`,
          detail: "Subscribers who match the condition stop here.",
        });
      }
      if (!ports?.has("false")) {
        issues.push({
          id: `false-${node.id}`,
          nodeId: node.id,
          title: `${node.title} has no FALSE path`,
          detail: "Subscribers who don’t match the condition stop here.",
        });
      }
    } else if (node.kind === "trigger" && !ports?.size) {
      issues.push({
        id: `dead-${node.id}`,
        nodeId: node.id,
        title: `${node.title} leads nowhere`,
        detail: "Connect it to the first step of the journey.",
      });
    }
  }

  return issues;
}
