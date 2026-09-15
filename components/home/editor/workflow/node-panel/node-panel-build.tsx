"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import { Field, Input, Textarea, fieldSurface } from "@/components/_ui/field";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/_ui/shadcn/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/_ui/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useWorkflowStore,
  type ActionKind,
  type WorkflowNode,
} from "@/stores/workflow-store";
import ReloadIcon from "@/public/assets/images/home/editor/workflow/reload.svg";
import BackspaceIcon from "@/public/assets/images/home/editor/workflow/backspace.svg";
import ChevronIcon from "@/public/assets/images/home/editor/workflow/chevron-right.svg";
import { ACTIONS } from "../workflow-actions";
import NodePanelRules, { deriveNode } from "./node-panel-rules";

type NodePanelBuildProps = {
  node: WorkflowNode;
};

const KINDS = Object.keys(ACTIONS) as ActionKind[];

export default function NodePanelBuild({ node }: NodePanelBuildProps) {
  const [rulesOpen, setRulesOpen] = useState(node.kind === "branch");
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const checkpoint = useWorkflowStore((state) => state.checkpoint);
  const changeKind = useWorkflowStore((state) => state.changeKind);
  const removeNode = useWorkflowStore((state) => state.removeNode);
  const action = ACTIONS[node.kind];
  const { Icon } = action;

  const resetNode = () => {
    checkpoint();
    updateNode(node.id, {
      title: action.title,
      description: action.description,
      rules: undefined,
    });
  };

  const changeRules = (rules: Record<string, string>) => {
    updateNode(node.id, { rules, ...deriveNode(node, rules) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[16px] leading-6 font-[550] text-white text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]">
          Details
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="brick"
            size="icon-lg"
            aria-label="Reset step to defaults"
            onClick={resetNode}
          >
            <ReloadIcon aria-hidden className="size-5" />
          </Button>
          <Button
            variant="brick"
            size="icon-lg"
            aria-label="Delete step"
            onClick={() => removeNode(node.id)}
          >
            <BackspaceIcon aria-hidden className="size-5 text-[#e33e31]" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Field label="Type">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                fieldSurface,
                "group flex h-9 w-full cursor-pointer items-center px-1 py-1.5 text-left data-[state=open]:shadow-[0_0_0_1px_#17171c,0_0_0_4px_rgb(117_71_255/0.2),inset_0_0_0_1px_#7445ff]",
                action.theme,
              )}
            >
              <span className="flex shrink-0 items-center pl-1">
                <Icon aria-hidden className="size-[18px] text-(--accent)" />
              </span>
              <span className="min-w-0 flex-1 truncate pr-4 pl-2">
                {action.label}
              </span>
              <ChevronIcon
                aria-hidden
                className="ease-power3-in-out mr-2 size-4 rotate-90 text-white/40 opacity-0 transition-[opacity,rotate] duration-200 group-hover:opacity-100 group-data-[state=open]:-rotate-90 group-data-[state=open]:opacity-100"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width)"
            >
              {KINDS.map((kind) => {
                const option = ACTIONS[kind];
                return (
                  <DropdownMenuItem
                    key={kind}
                    className={option.theme}
                    onSelect={() =>
                      changeKind(node.id, kind, {
                        title: option.title,
                        description: option.description,
                      })
                    }
                  >
                    <option.Icon
                      aria-hidden
                      className="size-4 text-(--accent)"
                    />
                    {option.label}
                    {kind === node.kind && (
                      <span className="ml-auto size-1.5 rounded-full bg-(--accent)" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </Field>

        <Field label="Name" htmlFor={`${node.id}-name`}>
          <Input
            id={`${node.id}-name`}
            value={node.title}
            onFocus={checkpoint}
            onChange={(event) =>
              updateNode(node.id, { title: event.target.value })
            }
          />
        </Field>

        <Field label="Description" htmlFor={`${node.id}-description`}>
          <Textarea
            id={`${node.id}-description`}
            placeholder="Describe your actions"
            value={node.description}
            onFocus={checkpoint}
            onChange={(event) =>
              updateNode(node.id, { description: event.target.value })
            }
          />
        </Field>

        <Collapsible
          open={rulesOpen}
          onOpenChange={setRulesOpen}
          className="flex flex-col gap-1"
        >
          <CollapsibleTrigger className="group flex h-6 w-full cursor-pointer items-center justify-between rounded-[6px] text-[12px] leading-6 font-[550] text-white/50 outline-none hover:text-white/70 focus-visible:ring-2 focus-visible:ring-[#7f59f0]/60">
            Rules
            <ChevronIcon
              aria-hidden
              className="ease-smooth-in-out size-4 rotate-90 transition-transform duration-300 group-data-[state=open]:-rotate-90"
            />
          </CollapsibleTrigger>
          <CollapsibleContent
            onFocusCapture={checkpoint}
            className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden"
          >
            <div className="pt-2 pb-1">
              <NodePanelRules node={node} onChange={changeRules} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
