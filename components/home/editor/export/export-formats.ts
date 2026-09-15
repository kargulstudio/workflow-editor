import type { Automation, AutomationGraph } from "@/data/automations";
import type { RunLog } from "@/stores/workflow-store";
import { ACTIONS } from "../workflow/workflow-actions";

export type ExportFormat = "json" | "csv" | "markdown";

export type ExportOptions = {
  includeRules: boolean;
  includeLogs: boolean;
};

export const FORMAT_META: Record<
  ExportFormat,
  { label: string; extension: string; mime: string; description: string }
> = {
  json: {
    label: "Workflow JSON",
    extension: "json",
    mime: "application/json",
    description:
      "Every step and connection. Re-import it or keep it in version control.",
  },
  csv: {
    label: "Steps report",
    extension: "csv",
    mime: "text/csv",
    description:
      "One row per step with its type, copy and connections for spreadsheets.",
  },
  markdown: {
    label: "Markdown brief",
    extension: "md",
    mime: "text/markdown",
    description:
      "A readable outline to share with your team or paste into docs.",
  },
};

function ordered(graph: AutomationGraph) {
  return graph.nodes.toSorted((a, b) => a.y - b.y || a.x - b.x);
}

function slug(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "automation"
  );
}

export function fileName(automation: Automation, format: ExportFormat) {
  return `${slug(automation.name)}.${FORMAT_META[format].extension}`;
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function buildExport(
  format: ExportFormat,
  automation: Automation,
  graph: AutomationGraph,
  logs: RunLog[],
  options: ExportOptions,
) {
  const steps = ordered(graph);
  const titleOf = (id: string) =>
    graph.nodes.find((node) => node.id === id)?.title ?? id;

  if (format === "csv") {
    const rows = [
      ["step", "type", "title", "description", "next"],
      ...steps.map((node, index) => [
        String(index + 1),
        ACTIONS[node.kind].label,
        node.title,
        node.description,
        graph.edges
          .filter((edge) => edge.source === node.id)
          .map(
            (edge) =>
              `${edge.port === "out" ? "" : `${edge.port.toUpperCase()} → `}${titleOf(edge.target)}`,
          )
          .join(" | "),
      ]),
    ];
    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }

  if (format === "markdown") {
    const lines = [
      `# ${automation.name}`,
      "",
      `> ${automation.description}`,
      "",
      `**Status:** ${automation.status} · **Steps:** ${steps.length} · **Enrolled:** ${automation.enrolled}`,
      "",
      "## Steps",
      "",
      ...steps.flatMap((node, index) => {
        const next = graph.edges.filter((edge) => edge.source === node.id);
        return [
          `${index + 1}. **${ACTIONS[node.kind].label}** — ${node.title}`,
          `   ${node.description}`,
          ...next.map(
            (edge) =>
              `   - ${edge.port === "out" ? "Then" : `If ${edge.port.toUpperCase()}`} → ${titleOf(edge.target)}`,
          ),
        ];
      }),
    ];
    if (options.includeLogs && logs.length) {
      lines.push(
        "",
        "## Latest test run",
        "",
        ...logs.slice(-12).map((log) => `- ${log.message}`),
      );
    }
    return lines.join("\n");
  }

  return JSON.stringify(
    {
      name: automation.name,
      description: automation.description,
      status: automation.status,
      version: 1,
      steps: steps.map((node) => ({
        id: node.id,
        type: node.kind,
        title: node.title,
        description: node.description,
        ...(options.includeRules && node.rules ? { rules: node.rules } : {}),
        position: { x: node.x, y: node.y },
      })),
      connections: graph.edges.map((edge) => ({
        from: edge.source,
        to: edge.target,
        ...(edge.port === "out" ? {} : { when: edge.port }),
      })),
      ...(options.includeLogs && logs.length
        ? {
            testRun: logs
              .slice(-20)
              .map((log) => ({ level: log.level, message: log.message })),
          }
        : {}),
    },
    null,
    2,
  );
}
