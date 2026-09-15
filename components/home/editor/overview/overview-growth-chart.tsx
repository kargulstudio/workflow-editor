"use client";

import { useId, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import useMeasure from "react-use-measure";
import IconBadge from "@/components/_ui/icon-badge";
import Divider from "@/components/_ui/divider";
import ChartIcon from "@/public/assets/images/home/editor/overview/chart.svg";
import { seeded, type ChartData } from "./overview-data";

type OverviewGrowthChartProps = {
  data: ChartData;
  animationKey: string;
};

const AXIS_WIDTH = 28;
const TICK_TOP = 11;
const TICK_BOTTOM_OFFSET = 9;
const BAR_GAP = 44;

export default function OverviewGrowthChart({
  data,
  animationKey,
}: OverviewGrowthChartProps) {
  const [ref, bounds] = useMeasure();
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();

  const plotWidth = Math.max(0, bounds.width - AXIS_WIDTH);
  const plotHeight = Math.max(0, bounds.height - 18);
  const top = TICK_TOP;
  const bottom = plotHeight - TICK_BOTTOM_OFFSET;
  const total = data.steps.reduce((sum, step) => sum + step.width, 0);
  const scaleX = plotWidth / total;
  const y = (value: number) => bottom - (value / data.max) * (bottom - top);

  const segments = data.steps.reduce<
    { x0: number; x1: number; value: number }[]
  >((list, step) => {
    const x0 = list.at(-1)?.x1 ?? 0;
    return [...list, { x0, x1: x0 + step.width * scaleX, value: step.value }];
  }, []);

  const line = segments
    .map((segment, index) => {
      const move =
        index === 0
          ? `M${segment.x0} ${y(segment.value)}`
          : `V${y(segment.value)}`;
      return `${move} H${segment.x1}`;
    })
    .join(" ");
  const area = `${line} V${bottom} H0 Z`;

  const sparkles = segments
    .flatMap((segment, index) =>
      Array.from(
        { length: Math.round((segment.x1 - segment.x0) / 14) },
        (_, dot) => {
          const seed = `${animationKey}-${index}-${dot}`;
          return {
            key: seed,
            cx:
              segment.x0 +
              6 +
              seeded(`${seed}-x`) * Math.max(0, segment.x1 - segment.x0 - 12),
            cy:
              y(segment.value) +
              14 +
              seeded(`${seed}-y`) * Math.max(0, bottom - y(segment.value) - 20),
            r: 0.4 + seeded(`${seed}-r`) * 0.6,
            opacity: 0.3 + seeded(`${seed}-o`) * 0.6,
          };
        },
      ),
    )
    .filter((dot) => dot.cy < bottom - 4);

  const ticks = [4, 3, 2, 1, 0].map((index) => (data.max / 4) * index);
  const barWidth = Math.max(0, (plotWidth - BAR_GAP * 5) / 6);
  const hovered = hover === null ? null : segments[hover];

  const handleMove = (event: PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const index = segments.findIndex(
      (segment) => x >= segment.x0 && x <= segment.x1,
    );
    setHover(index === -1 ? null : index);
  };

  return (
    <section
      aria-label={data.title}
      className="relative flex min-h-[399px] flex-col overflow-clip rounded-[16px] bg-[#141417] shadow-[0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12)]"
    >
      <div className="flex shrink-0 items-center gap-3.5 bg-[#18181c] px-[18px] py-3.5">
        <IconBadge>
          <ChartIcon className="size-[22px] text-white" />
        </IconBadge>
        <span className="text-[16px] leading-6 font-[550] text-white text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]">
          {data.title}
        </span>
      </div>
      <Divider />
      <div className="flex min-h-0 flex-1 flex-col px-5 pt-8 pb-6">
        <div ref={ref} className="relative min-h-[245px] flex-1">
          {bounds.width > 0 && (
            <svg
              width={bounds.width}
              height={bounds.height}
              className="absolute inset-0 overflow-visible"
              role="img"
              aria-label={`${data.title}: ${data.steps.map((step, index) => `${data.labels[Math.min(index, data.labels.length - 1)]} ${data.format(step.value)}`).join(", ")}`}
            >
              <defs>
                <linearGradient id={`${id}-bar`} x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="white" stopOpacity="0" />
                  <stop offset="1" stopColor="white" stopOpacity="0.03" />
                </linearGradient>
                <linearGradient
                  id={`${id}-line`}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1={bottom}
                  x2={plotWidth}
                  y2={top}
                >
                  <stop stopColor="#4961fc" />
                  <stop offset="0.41" stopColor="#7649fc" />
                  <stop offset="0.62" stopColor="#bd49fc" />
                  <stop offset="1" stopColor="#12a8ff" />
                </linearGradient>
                <linearGradient
                  id={`${id}-fill`}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1={top + 40}
                  x2="0"
                  y2={bottom}
                >
                  <stop stopColor="#7649fc" stopOpacity="0.16" />
                  <stop offset="1" stopColor="#7649fc" stopOpacity="0" />
                </linearGradient>
                <filter
                  id={`${id}-glow`}
                  x="-10%"
                  y="-20%"
                  width="120%"
                  height="160%"
                >
                  <feDropShadow
                    dx="0"
                    dy="7"
                    stdDeviation="6.5"
                    floodColor="#5016ff"
                    floodOpacity="0.5"
                  />
                </filter>
              </defs>

              <g opacity="0.5">
                {Array.from({ length: 6 }, (_, index) => (
                  <rect
                    key={index}
                    x={index * (barWidth + BAR_GAP)}
                    y={0}
                    width={barWidth}
                    height={bottom + TICK_BOTTOM_OFFSET}
                    fill={`url(#${id}-bar)`}
                  />
                ))}
              </g>

              <line
                x1={0}
                x2={plotWidth}
                y1={bottom}
                y2={bottom}
                stroke="white"
                strokeOpacity="0.1"
                strokeDasharray="3 6"
                strokeLinecap="round"
              />

              {ticks.map((tick) => (
                <text
                  key={tick}
                  x={bounds.width}
                  y={y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-white/30 text-[12px] tabular-nums"
                >
                  {data.max === 8 ? tick : data.format(tick)}
                </text>
              ))}

              <g key={animationKey}>
                <path
                  d={area}
                  fill={`url(#${id}-fill)`}
                  className="animate-fade-in"
                />
                {sparkles.map((dot) => (
                  <circle
                    key={dot.key}
                    cx={dot.cx}
                    cy={dot.cy}
                    r={dot.r}
                    fill="#6fb6ff"
                    opacity={dot.opacity}
                    className="animate-fade-in"
                  />
                ))}
                <path
                  d={line}
                  fill="none"
                  stroke={`url(#${id}-line)`}
                  strokeWidth={3}
                  pathLength={1}
                  strokeDasharray="1"
                  filter={`url(#${id}-glow)`}
                  className="animate-chart-draw motion-reduce:animate-none"
                />
              </g>

              {hovered && (
                <g pointerEvents="none">
                  <line
                    x1={(hovered.x0 + hovered.x1) / 2}
                    x2={(hovered.x0 + hovered.x1) / 2}
                    y1={y(hovered.value)}
                    y2={bottom}
                    stroke="white"
                    strokeOpacity="0.16"
                    strokeDasharray="2 4"
                  />
                  <circle
                    cx={(hovered.x0 + hovered.x1) / 2}
                    cy={y(hovered.value)}
                    r={4}
                    fill="#141417"
                    stroke="white"
                    strokeWidth={2}
                  />
                </g>
              )}

              <rect
                x={0}
                y={0}
                width={plotWidth}
                height={bottom + TICK_BOTTOM_OFFSET}
                fill="transparent"
                onPointerMove={handleMove}
                onPointerLeave={() => setHover(null)}
              />
            </svg>
          )}

          {hovered && (
            <span
              style={
                {
                  "--tip-x": `${(hovered.x0 + hovered.x1) / 2}px`,
                  "--tip-y": `${y(hovered.value)}px`,
                } as CSSProperties
              }
              className="pointer-events-none absolute top-0 left-0 z-10 flex -translate-x-1/2 -translate-y-[calc(100%+12px)] [translate:var(--tip-x)_var(--tip-y)] flex-col items-center rounded-[8px] bg-[#1f1f25] px-2.5 py-1.5 text-center shadow-[0_8px_16px_rgb(0_0_0/0.32),0_0_0_1px_rgb(0_0_0/0.32),inset_0_1px_0_rgb(255_255_255/0.06)]"
            >
              <span className="text-[14px] leading-5 font-[550] text-white tabular-nums">
                {data.format(hovered.value)}
              </span>
              <span className="text-[11px] leading-4 text-white/50">
                {
                  data.labels[
                    Math.min(
                      Math.floor(
                        (hover! / data.steps.length) * data.labels.length,
                      ),
                      data.labels.length - 1,
                    )
                  ]
                }
              </span>
            </span>
          )}
        </div>
        <div className="flex h-[18px] shrink-0 items-center justify-between pr-[50px] pl-2 text-[12px] leading-[18px] font-normal text-white/30">
          {data.labels.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]" />
    </section>
  );
}
