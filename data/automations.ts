import type {
  ActionKind,
  PortId,
  WorkflowEdge,
  WorkflowNode,
} from "@/stores/workflow-store";

export type AutomationStatus = "draft" | "running" | "paused";

export type AutomationCategory = "welcome" | "engagement" | "nurture";

export type AutomationGraph = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };

export type Automation = {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  category: AutomationCategory;
  enrolled: number;
  completed: number;
  createdAt: number;
  updatedAt: number;
};

type Step = [id: string, kind: ActionKind, title: string, description: string];

const NODE_GAP = 80;
const BRANCH_DROP = 120;
const BRANCH_OFFSET = 220;

function heightOf(description: string) {
  return description.length > 56 ? 145 : 121;
}

function column(prefix: string, steps: Step[], x: number, y: number) {
  const nodes: WorkflowNode[] = [];
  let cursor = y;
  for (const [id, kind, title, description] of steps) {
    nodes.push({
      id: `${prefix}-${id}`,
      kind,
      x,
      y: cursor,
      title,
      description,
    });
    cursor += heightOf(description) + NODE_GAP;
  }
  return { nodes, bottom: cursor - NODE_GAP };
}

function link(
  prefix: string,
  pairs: [source: string, target: string, port?: PortId][],
): WorkflowEdge[] {
  return pairs.map(([source, target, port = "out"]) => ({
    id: `${prefix}-${source}-${target}`,
    source: `${prefix}-${source}`,
    port,
    target: `${prefix}-${target}`,
  }));
}

function branchChildren(
  prefix: string,
  bottom: number,
  truthy: Step[],
  falsy: Step[],
) {
  const top = bottom + BRANCH_DROP;
  const left = column(prefix, truthy, -BRANCH_OFFSET, top);
  const right = column(prefix, falsy, BRANCH_OFFSET, top);
  return {
    nodes: [...left.nodes, ...right.nodes],
    bottom: Math.max(left.bottom, right.bottom),
  };
}

function buzzing(): AutomationGraph {
  const p = "buzzing";
  const main = column(
    p,
    [
      [
        "trigger",
        "trigger",
        "Signed Up",
        "Triggered when a new subscriber signs up for your newsletter",
      ],
      [
        "wait",
        "wait-until",
        "Monday at 9:00 AM",
        "Ensures the welcome email is sent at an optimal time.",
      ],
      [
        "branch",
        "branch",
        "Branch on 0 conditions",
        "Need to add a condition, e.g., Opened Email 1 = True",
      ],
    ],
    0,
    0,
  );
  return {
    nodes: main.nodes,
    edges: link(p, [
      ["trigger", "wait"],
      ["wait", "branch"],
    ]),
  };
}

function firstHello(): AutomationGraph {
  const p = "hello";
  const main = column(
    p,
    [
      [
        "trigger",
        "trigger",
        "Signed Up",
        "Triggered when a new subscriber joins from the homepage form",
      ],
      [
        "email-1",
        "send-email",
        "Hello from the hive 👋",
        "A short hello with what to expect from us.",
      ],
      [
        "delay",
        "time-delay",
        "Wait 2 days",
        "Gives new subscribers time to read the first email.",
      ],
      [
        "email-2",
        "send-email",
        "Your getting started guide",
        "Links to the three most read issues.",
      ],
      [
        "tag",
        "update-subscription",
        "Tag as onboarded",
        "Adds the onboarded tag to the subscriber.",
      ],
    ],
    0,
    0,
  );
  return {
    nodes: main.nodes,
    edges: link(p, [
      ["trigger", "email-1"],
      ["email-1", "delay"],
      ["delay", "email-2"],
      ["email-2", "tag"],
    ]),
  };
}

function welcomeJourney(): AutomationGraph {
  const p = "journey";
  const main = column(
    p,
    [
      [
        "trigger",
        "trigger",
        "Signed Up",
        "Triggered when a subscriber confirms their email address",
      ],
      [
        "email",
        "send-email",
        "Welcome aboard 🚀",
        "Introduces the newsletter and the course ahead.",
      ],
      [
        "delay",
        "time-delay",
        "Wait 1 day",
        "Pauses before checking engagement.",
      ],
      [
        "branch",
        "branch",
        "Opened welcome email",
        "True when the welcome email was opened.",
      ],
    ],
    0,
    0,
  );
  const children = branchChildren(
    p,
    main.bottom,
    [
      [
        "lesson-1",
        "send-email",
        "Lesson 1: Writing hooks",
        "First lesson of the five day email course.",
      ],
      [
        "lesson-delay",
        "time-delay",
        "Wait 1 day",
        "Spaces lessons out by a day.",
      ],
      [
        "lesson-2",
        "send-email",
        "Lesson 2: Growing a list",
        "Second lesson with a worksheet attached.",
      ],
    ],
    [
      [
        "resend",
        "send-email",
        "Welcome aboard (new subject)",
        "Resends the welcome with a sharper subject.",
      ],
      [
        "resend-delay",
        "time-delay",
        "Wait 2 days",
        "Gives the resend time to land.",
      ],
    ],
  );
  return {
    nodes: [...main.nodes, ...children.nodes],
    edges: link(p, [
      ["trigger", "email"],
      ["email", "delay"],
      ["delay", "branch"],
      ["branch", "lesson-1", "true"],
      ["lesson-1", "lesson-delay"],
      ["lesson-delay", "lesson-2"],
      ["branch", "resend", "false"],
      ["resend", "resend-delay"],
    ]),
  };
}

function youreIn(): AutomationGraph {
  const p = "youre-in";
  const main = column(
    p,
    [
      [
        "trigger",
        "trigger",
        "Joined via referral",
        "Triggered when a subscriber arrives from a referral link",
      ],
      [
        "email",
        "send-email",
        "You're in! 🎉",
        "Instant welcome with next steps for new readers.",
      ],
      [
        "webhook",
        "send-webhook",
        "Notify the CRM",
        "Sends the new subscriber to the CRM.",
      ],
      [
        "enroll",
        "enroll",
        "First Hello Flow",
        "Hands the subscriber over to the hello series.",
      ],
    ],
    0,
    0,
  );
  return {
    nodes: main.nodes,
    edges: link(p, [
      ["trigger", "email"],
      ["email", "webhook"],
      ["webhook", "enroll"],
    ]),
  };
}

function letsGetStarted(): AutomationGraph {
  const p = "started";
  const main = column(
    p,
    [
      [
        "trigger",
        "trigger",
        "Signed Up",
        "Triggered when a subscriber picks the Getting started topic",
      ],
      [
        "wait",
        "wait-until",
        "Monday at 9:00 AM",
        "Starts the week with a fresh kickoff email.",
      ],
      [
        "email",
        "send-email",
        "Let's get started 👋",
        "Kicks off engagement with next-step guidance.",
      ],
      [
        "branch",
        "branch",
        "Clicked the main CTA",
        "True when the subscriber clicked Get started.",
      ],
    ],
    0,
    0,
  );
  const children = branchChildren(
    p,
    main.bottom,
    [
      [
        "enroll",
        "enroll",
        "Next Steps & Tips",
        "Moves engaged readers to the tips series.",
      ],
    ],
    [
      [
        "delay",
        "time-delay",
        "Wait 3 days",
        "Waits before sending a gentle reminder.",
      ],
      [
        "reminder",
        "send-email",
        "Still thinking it over?",
        "A short reminder with one clear link.",
      ],
    ],
  );
  return {
    nodes: [...main.nodes, ...children.nodes],
    edges: link(p, [
      ["trigger", "wait"],
      ["wait", "email"],
      ["email", "branch"],
      ["branch", "enroll", "true"],
      ["branch", "delay", "false"],
      ["delay", "reminder"],
    ]),
  };
}

function stillWithUs(): AutomationGraph {
  const p = "still";
  const main = column(
    p,
    [
      [
        "trigger",
        "trigger",
        "Inactive for 30 days",
        "Triggered when a subscriber has not opened in 30 days",
      ],
      [
        "email",
        "send-email",
        "Still with us? 👀",
        "Asks inactive readers if they want to stay.",
      ],
      [
        "delay",
        "time-delay",
        "Wait 3 days",
        "Gives the subscriber a few days to respond.",
      ],
      [
        "branch",
        "branch",
        "Opened re-engagement email",
        "True when the subscriber opened the email.",
      ],
    ],
    0,
    0,
  );
  const children = branchChildren(
    p,
    main.bottom,
    [
      [
        "active",
        "update-subscription",
        "Mark as active",
        "Removes the inactive tag from the subscriber.",
      ],
    ],
    [
      [
        "cleanup",
        "update-subscription",
        "Unsubscribe quietly",
        "Keeps the list healthy by removing ghosts.",
      ],
      [
        "sync",
        "send-webhook",
        "Sync with the CRM",
        "Tells the CRM this contact churned.",
      ],
    ],
  );
  return {
    nodes: [...main.nodes, ...children.nodes],
    edges: link(p, [
      ["trigger", "email"],
      ["email", "delay"],
      ["delay", "branch"],
      ["branch", "active", "true"],
      ["branch", "cleanup", "false"],
      ["cleanup", "sync"],
    ]),
  };
}

function nextSteps(): AutomationGraph {
  const p = "tips";
  const main = column(
    p,
    [
      [
        "trigger",
        "trigger",
        "Finished onboarding",
        "Triggered when the onboarded tag is added to a subscriber",
      ],
      [
        "tip-1",
        "send-email",
        "Tip #1: Save your favourites",
        "How to bookmark issues for later.",
      ],
      [
        "delay-1",
        "time-delay",
        "Wait 2 days",
        "Keeps tips from piling up in the inbox.",
      ],
      [
        "tip-2",
        "send-email",
        "Tip #2: Reply to the author",
        "Encourages readers to hit reply.",
      ],
      [
        "delay-2",
        "time-delay",
        "Wait 2 days",
        "Keeps tips from piling up in the inbox.",
      ],
      [
        "tip-3",
        "send-email",
        "Tip #3: Share and earn 💡",
        "Introduces the referral programme.",
      ],
    ],
    0,
    0,
  );
  return {
    nodes: main.nodes,
    edges: link(p, [
      ["trigger", "tip-1"],
      ["tip-1", "delay-1"],
      ["delay-1", "tip-2"],
      ["tip-2", "delay-2"],
      ["delay-2", "tip-3"],
    ]),
  };
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export function seedAutomations(now: number): Automation[] {
  return [
    {
      id: "buzzing",
      name: "🐝 Buzzing Your Inbox",
      description: "Sends a welcome sequence to new subscribers",
      status: "draft",
      category: "welcome",
      enrolled: 0,
      completed: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "hello",
      name: "First Hello Flow",
      description: "A short email sequence to greet and guide new users",
      status: "running",
      category: "welcome",
      enrolled: 76,
      completed: 65,
      createdAt: now - 1 * DAY,
      updatedAt: now - 2 * MINUTE,
    },
    {
      id: "journey",
      name: "Welcome Journey 🚀",
      description: "Full onboarding experience with delayed education emails",
      status: "running",
      category: "nurture",
      enrolled: 12,
      completed: 16,
      createdAt: now - 2 * DAY,
      updatedAt: now - 60 * MINUTE,
    },
    {
      id: "youre-in",
      name: "You’re In! 🎉",
      description: "Instant welcome + next steps for newsletter readers",
      status: "draft",
      category: "welcome",
      enrolled: 0,
      completed: 0,
      createdAt: now - 3 * DAY,
      updatedAt: now - 25 * MINUTE,
    },
    {
      id: "started",
      name: "Let’s Get Started 👋",
      description: "Kicks off engagement with next-step guidance",
      status: "draft",
      category: "engagement",
      enrolled: 0,
      completed: 0,
      createdAt: now - 4 * DAY,
      updatedAt: now - 50 * MINUTE,
    },
    {
      id: "still",
      name: "Still With Us? 👀",
      description: "Re-engagement flow for inactive new subscribers",
      status: "paused",
      category: "engagement",
      enrolled: 42,
      completed: 73,
      createdAt: now - 5 * DAY,
      updatedAt: now - 25 * MINUTE,
    },
    {
      id: "tips",
      name: "Next Steps & Tips 💡",
      description: "Sends helpful tips and links after initial welcome",
      status: "running",
      category: "nurture",
      enrolled: 89,
      completed: 112,
      createdAt: now - 6 * DAY,
      updatedAt: now - 1 * DAY,
    },
  ];
}

export const SEED_GRAPHS: Record<string, () => AutomationGraph> = {
  buzzing,
  hello: firstHello,
  journey: welcomeJourney,
  "youre-in": youreIn,
  started: letsGetStarted,
  still: stillWithUs,
  tips: nextSteps,
};

export function blankGraph(id: string): AutomationGraph {
  return {
    nodes: [
      {
        id: `${id}-trigger`,
        kind: "trigger",
        x: 0,
        y: 0,
        title: "Signed Up",
        description:
          "Triggered when a new subscriber signs up for your newsletter",
      },
    ],
    edges: [],
  };
}
