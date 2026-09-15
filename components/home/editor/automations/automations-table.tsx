"use client";

import Button from "@/components/_ui/button";
import Tag from "@/components/_ui/tag";
import type { Automation } from "@/data/automations";
import { STATUS_LABEL } from "@/stores/app-store";
import SortIcon from "@/public/assets/images/home/editor/automations/sort.svg";
import { STATUS_TONE } from "../editor-topbar";
import { relativeTime } from "./automations-utils";

type AutomationsTableProps = {
  automations: Automation[];
  now: number;
  sortedByEdit: boolean;
  descending: boolean;
  onSortByEdit: () => void;
  onOpen: (id: string) => void;
};

const columns =
  "grid grid-cols-[minmax(180px,180fr)_minmax(350px,350fr)_minmax(160px,160fr)_minmax(180px,180fr)_minmax(200px,200fr)_minmax(224px,224fr)]";

const cellDivider =
  "bg-[linear-gradient(to_right,rgb(0_0_0/0.12)_0,rgb(0_0_0/0.12)_1px,rgb(255_255_255/0.018)_1px,rgb(255_255_255/0.018)_2px,transparent_2px)]";

function Count({ value }: { value: number }) {
  return (
    <span className="text-[14px] leading-6 whitespace-pre">
      <span className="font-[550] text-white tabular-nums">{value}</span>
      {"  "}
      <span className="font-normal text-white/60">subscribers</span>
    </span>
  );
}

export default function AutomationsTable({
  automations,
  now,
  sortedByEdit,
  descending,
  onSortByEdit,
  onOpen,
}: AutomationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-[12px] shadow-[0_0_0_1px_rgb(0_0_0/0.14),0_1px_0_rgb(0_0_0/0.2),inset_0_1px_0_rgb(255_255_255/0.08),inset_0_0_0_1px_rgb(255_255_255/0.03)]">
      <div
        role="table"
        aria-label="Automations"
        className="min-w-[1294px] overflow-hidden rounded-[12px] bg-[#111114]"
      >
        <div role="rowgroup">
          <div role="row" className={`${columns} h-11 bg-[#16161a]`}>
            {[
              "Automations Name",
              "Descriptions",
              "Status",
              "Subscribers Enrolled",
              "Subscribers Completed",
            ].map((label) => (
              <span
                key={label}
                role="columnheader"
                className="flex items-center px-5 text-[14px] leading-6 font-medium text-white/50 text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]"
              >
                {label}
              </span>
            ))}
            <span
              role="columnheader"
              aria-sort={
                sortedByEdit
                  ? descending
                    ? "descending"
                    : "ascending"
                  : "none"
              }
              className="flex items-center px-5"
            >
              <Button
                variant="bare"
                size="bare"
                onClick={onSortByEdit}
                className="group -mx-1 flex h-7 cursor-pointer items-center gap-1.5 rounded-[6px] px-1 text-[14px] leading-6 font-medium text-white/50 transition-colors duration-150 outline-none text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[#7f59f0]/60"
              >
                Last Edited
                <SortIcon
                  aria-hidden
                  data-ascending={(sortedByEdit && !descending) || undefined}
                  className="ease-power3-in-out size-4 text-white/40 transition-transform duration-200 data-ascending:-scale-y-100"
                />
              </Button>
            </span>
          </div>
        </div>

        <div role="rowgroup" className="flex flex-col gap-0.5 pt-0.5">
          {automations.map((automation) => {
            const edited = relativeTime(automation.updatedAt, now);
            return (
              <div
                key={automation.id}
                role="row"
                tabIndex={0}
                onClick={() => onOpen(automation.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(automation.id);
                  }
                }}
                className={`${columns} ease-power3-in-out h-11 cursor-pointer items-center bg-[#101014] shadow-[0_-1px_0_#131317] transition-colors duration-150 outline-none hover:bg-[#15151a] focus-visible:bg-[#15151a] focus-visible:shadow-[inset_0_0_0_1px_rgb(127_89_240/0.6)]`}
              >
                <span
                  role="cell"
                  className="flex h-10 min-w-0 items-center px-4"
                >
                  <span className="truncate text-[14px] leading-6 font-[550] text-[#fcfdff]/90">
                    {automation.name}
                  </span>
                </span>
                <span
                  role="cell"
                  className={`flex h-full min-w-0 items-center px-4 ${cellDivider}`}
                >
                  <span className="truncate text-[14px] leading-6 font-normal text-white/50">
                    {automation.description}
                  </span>
                </span>
                <span
                  role="cell"
                  className={`flex h-full items-center px-4 ${cellDivider}`}
                >
                  <Tag tone={STATUS_TONE[automation.status]}>
                    {STATUS_LABEL[automation.status]}
                  </Tag>
                </span>
                <span
                  role="cell"
                  className={`flex h-full items-center px-4 ${cellDivider}`}
                >
                  <Count value={automation.enrolled} />
                </span>
                <span
                  role="cell"
                  className={`flex h-full items-center px-4 ${cellDivider}`}
                >
                  <Count value={automation.completed} />
                </span>
                <span
                  role="cell"
                  className={`flex h-full items-center px-4 ${cellDivider}`}
                >
                  <span className="text-[14px] leading-6 font-normal text-white">
                    {edited.value ? (
                      <>
                        <span className="font-medium tabular-nums">
                          {edited.value}
                        </span>{" "}
                        <span className="text-white/60">{edited.unit}</span>
                      </>
                    ) : (
                      <span className="font-medium">{edited.unit}</span>
                    )}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
