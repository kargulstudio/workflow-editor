export type OverviewTab =
  | "overview"
  | "subscribers"
  | "activity"
  | "monetization";

export const OVERVIEW_TABS: { value: OverviewTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "subscribers", label: "Subscribers" },
  { value: "activity", label: "Activity" },
  { value: "monetization", label: "Monetization" },
];

export const RANGES = [
  "Last 7 Days",
  "Last 4 Weeks",
  "Last 3 Months",
  "Last 12 Months",
] as const;
export type Range = (typeof RANGES)[number];

export type StatIcon = "user" | "mail" | "click";

export type Stat = {
  label: string;
  icon: StatIcon;
  value: string;
  unit?: string;
  from: string;
  change: string;
  negative?: boolean;
};

export type Step = { value: number; width: number };

export type ChartData = {
  title: string;
  steps: Step[];
  max: number;
  labels: string[];
  format: (value: number) => string;
};

export type Post = {
  title: string;
  sent: number;
  opened: number;
  clicked: number;
  date: string;
};

export const POST_SORTS = ["Open Rate", "Click Rate", "Sent"] as const;
export type PostSort = (typeof POST_SORTS)[number];

const DESIGN_STEPS: Step[] = [
  { value: 2.44, width: 94 },
  { value: 0.75, width: 51.5 },
  { value: 3.96, width: 96 },
  { value: 2.44, width: 92 },
  { value: 0, width: 96 },
  { value: 5.38, width: 43 },
  { value: 7.15, width: 51 },
];

const LABELS: Record<Range, string[]> = {
  "Last 7 Days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "Last 4 Weeks": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "Last 3 Months": ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  "Last 12 Months": ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2"],
};

const RANGE_WORDS: Record<Range, string> = {
  "Last 7 Days": "last 7 days",
  "Last 4 Weeks": "last 4 weeks",
  "Last 3 Months": "last 3 months",
  "Last 12 Months": "last 12 months",
};

const RANGE_SCALE: Record<Range, number> = {
  "Last 7 Days": 0.4,
  "Last 4 Weeks": 1,
  "Last 3 Months": 2.6,
  "Last 12 Months": 9.5,
};

export function seeded(text: string) {
  let hash = 2166136261;
  for (const character of text) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

function shuffleSteps(seed: string, scale: number): Step[] {
  return DESIGN_STEPS.map((step, index) => ({
    width: step.width,
    value: Math.max(
      0,
      step.value * (0.55 + seeded(`${seed}-${index}`) * 0.9) * scale,
    ),
  }));
}

function niceMax(value: number) {
  if (value <= 8) return 8;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = Math.ceil(value / 4 / magnitude) * magnitude;
  return step * 4;
}

function compact(value: number) {
  if (value >= 1000)
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return String(Math.round(value));
}

export function overviewData(
  tab: OverviewTab,
  range: Range,
  seed: string,
  reach: number,
) {
  const scale = RANGE_SCALE[range];
  const since = `from ${Math.round(reach * 0.2 * scale)} (${RANGE_WORDS[range]})`;
  const isDesign = seed === "design" && range === "Last 4 Weeks";
  const pick = (base: number, spread = 0.6) =>
    base *
    (1 - spread / 2 + seeded(`${seed}-${tab}-${range}-${base}`) * spread);

  const changeFor = (key: string) => {
    const change = Math.round(
      12 + seeded(`${seed}-${tab}-${range}-${key}`) * 88,
    );
    const negative = seeded(`${seed}-${key}-sign`) > 0.8;
    return { change: `${negative ? "-" : "+"}${change}%`, negative };
  };

  let stats: Stat[];
  let chart: ChartData;

  const steps =
    isDesign && tab === "overview"
      ? DESIGN_STEPS
      : shuffleSteps(`${seed}-${tab}-${range}`, 1);

  switch (tab) {
    case "subscribers": {
      const total = Math.round(pick(reach * 1.4 + 120) * scale);
      stats = [
        {
          label: "Total Subscribers",
          icon: "user",
          value: compact(total),
          from: since,
          ...changeFor("total"),
        },
        {
          label: "New Subscribers",
          icon: "mail",
          value: compact(total * 0.18),
          from: since,
          ...changeFor("new"),
        },
        {
          label: "Unsubscribed",
          icon: "click",
          value: compact(total * 0.02),
          from: since,
          ...changeFor("lost"),
          negative: true,
        },
      ];
      const scaled = steps.map((step) => ({
        ...step,
        value: step.value * (total / 8),
      }));
      chart = {
        title: "Subscriber Growth Chart",
        steps: scaled,
        max: niceMax(Math.max(...scaled.map((step) => step.value))),
        labels: LABELS[range],
        format: compact,
      };
      break;
    }
    case "activity": {
      const sent = Math.round(pick(reach * 3 + 400) * scale);
      stats = [
        {
          label: "Emails Sent",
          icon: "mail",
          value: compact(sent),
          from: since,
          ...changeFor("sent"),
        },
        {
          label: "Unique Opens",
          icon: "user",
          value: compact(sent * 0.46),
          from: since,
          ...changeFor("opens"),
        },
        {
          label: "Link Clicks",
          icon: "click",
          value: compact(sent * 0.12),
          from: since,
          ...changeFor("clicks"),
        },
      ];
      const scaled = steps.map((step) => ({
        ...step,
        value: step.value * (sent / 16),
      }));
      chart = {
        title: "Email Activity Chart",
        steps: scaled,
        max: niceMax(Math.max(...scaled.map((step) => step.value))),
        labels: LABELS[range],
        format: compact,
      };
      break;
    }
    case "monetization": {
      const revenue = pick(reach * 9 + 380) * scale;
      stats = [
        {
          label: "Revenue",
          icon: "user",
          value: `$${compact(revenue)}`,
          from: since,
          ...changeFor("revenue"),
        },
        {
          label: "Paid Conversion",
          icon: "mail",
          value: (2 + seeded(`${seed}-conv`) * 6).toFixed(1),
          unit: "%",
          from: since,
          ...changeFor("conversion"),
        },
        {
          label: "Sponsor Clicks",
          icon: "click",
          value: compact(revenue * 0.3),
          from: since,
          ...changeFor("sponsor"),
        },
      ];
      const scaled = steps.map((step) => ({
        ...step,
        value: step.value * (revenue / 8),
      }));
      chart = {
        title: "Revenue Chart",
        steps: scaled,
        max: niceMax(Math.max(...scaled.map((step) => step.value))),
        labels: LABELS[range],
        format: (value) => `$${compact(value)}`,
      };
      break;
    }
    default: {
      stats = isDesign
        ? [
            {
              label: "Current Subscribers",
              icon: "user",
              value: "6",
              from: "from 0 (last 4 weeks)",
              change: "+100%",
            },
            {
              label: "Email Open Rate",
              icon: "mail",
              value: "18.8",
              unit: "%",
              from: "from 0 (last 4 weeks)",
              change: "+100%",
            },
            {
              label: "Click-Through Rate",
              icon: "click",
              value: "100",
              unit: "%",
              from: "from 0 (last 4 weeks)",
              change: "+100%",
            },
          ]
        : [
            {
              label: "Current Subscribers",
              icon: "user",
              value: compact(pick(reach + 6) * scale),
              from: since,
              ...changeFor("subs"),
            },
            {
              label: "Email Open Rate",
              icon: "mail",
              value: (12 + seeded(`${seed}-${range}-open`) * 40).toFixed(1),
              unit: "%",
              from: since,
              ...changeFor("open"),
            },
            {
              label: "Click-Through Rate",
              icon: "click",
              value: (4 + seeded(`${seed}-${range}-ctr`) * 30).toFixed(1),
              unit: "%",
              from: since,
              ...changeFor("ctr"),
            },
          ];
      chart = {
        title: "Subscriber Growth Chart",
        steps,
        max: 8,
        labels: LABELS[range],
        format: (value) => value.toFixed(1),
      };
    }
  }

  return { stats, chart };
}

export function topPosts(seed: string, sort: PostSort): Post[] {
  const isDesign = seed === "design";
  const posts: Post[] = [
    {
      title: "Next Steps & Tips 💡",
      date: "Jun 26, 14:02 PM",
      sent: 6,
      opened: 6,
      clicked: 6,
    },
    {
      title: "Still With Us? 👀",
      date: "Mar 12, 11:32 PM",
      sent: 6,
      opened: 6,
      clicked: 6,
    },
    {
      title: "Let’s Get Started 👋",
      date: "Jan 12, 08:10 AM",
      sent: 6,
      opened: 6,
      clicked: 6,
    },
    {
      title: "Welcome Journey 🚀",
      date: "Jan 04, 09:00 AM",
      sent: 6,
      opened: 5,
      clicked: 3,
    },
  ].map((post, index) =>
    isDesign
      ? post
      : {
          ...post,
          sent: Math.round(40 + seeded(`${seed}-sent-${index}`) * 160),
          opened: Math.round(20 + seeded(`${seed}-open-${index}`) * 80),
          clicked: Math.round(4 + seeded(`${seed}-click-${index}`) * 30),
        },
  );
  const key = (post: Post) =>
    sort === "Sent"
      ? post.sent
      : sort === "Click Rate"
        ? post.clicked / post.sent
        : post.opened / post.sent;
  const sorted =
    isDesign && sort === "Open Rate"
      ? posts
      : posts.toSorted((a, b) => key(b) - key(a));
  return sorted.slice(0, 3);
}
