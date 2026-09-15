"use client";

import { useState } from "react";
import Button from "@/components/_ui/button";
import Divider from "@/components/_ui/divider";
import IconBadge from "@/components/_ui/icon-badge";
import Tag from "@/components/_ui/tag";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/_ui/shadcn/dropdown-menu";
import PostsIcon from "@/public/assets/images/home/editor/overview/posts.svg";
import MailLineIcon from "@/public/assets/images/home/editor/overview/mail-line.svg";
import MailOpenedIcon from "@/public/assets/images/home/editor/overview/mail-opened.svg";
import ClickLineIcon from "@/public/assets/images/home/editor/overview/click-line.svg";
import ChevronIcon from "@/public/assets/images/home/editor/workflow/chevron-right.svg";
import { POST_SORTS, topPosts, type PostSort } from "./overview-data";

type OverviewTopPostsProps = {
  seed: string;
};

export default function OverviewTopPosts({ seed }: OverviewTopPostsProps) {
  const [sort, setSort] = useState<PostSort>("Open Rate");
  const posts = topPosts(seed, sort);

  return (
    <section
      aria-label="Top posts"
      className="relative flex min-h-[399px] flex-col overflow-clip rounded-[16px] bg-[#141417] shadow-[0_2px_4px_rgb(0_0_0/0.16),0_0_0_1px_rgb(0_0_0/0.12)]"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 bg-[#18181c] px-[18px] py-3.5">
        <div className="flex min-w-0 items-center gap-3.5">
          <IconBadge>
            <PostsIcon className="size-[22px] text-white" />
          </IconBadge>
          <span className="text-[16px] leading-6 font-[550] text-white text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]">
            Top Posts
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="field"
              size="field"
              className="gap-0 bg-[#202026] pl-1.5"
            >
              <span className="pr-1 pl-2">{sort}</span>
              <ChevronIcon
                aria-hidden
                className="ease-power3-in-out size-4 rotate-90 text-white/60 transition-transform duration-200 group-data-[state=open]:-rotate-90"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(value) => setSort(value as PostSort)}
            >
              {POST_SORTS.map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {option}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Divider />
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <ol className="flex flex-1 flex-col overflow-clip rounded-[14px] bg-[#18181c] shadow-[0_2px_4px_-1px_rgb(0_0_0/0.08),0_1px_1px_-1px_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.32),inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
          {posts.map((post, index) => (
            <li key={post.title} className="flex flex-1 flex-col">
              {index > 0 && <Divider />}
              <div
                key={`${post.title}-${sort}`}
                className="animate-fade-in flex flex-1 flex-col justify-center gap-[5px] px-3 py-2"
              >
                <span className="px-2 py-1 text-[14px] leading-5 font-[550] text-white">
                  {post.title}
                </span>
                <div className="flex items-center justify-between gap-3 rounded-[8px] px-2 py-1.5">
                  <div className="flex items-center gap-3 text-[14px] leading-6 font-medium text-white/80 tabular-nums text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)]">
                    <span className="flex items-center" title="Sent">
                      <MailLineIcon
                        aria-label="Sent"
                        className="size-[18px] text-white/60"
                      />
                      <span className="pr-1 pl-1">{post.sent}</span>
                    </span>
                    <span aria-hidden className="h-3.5 w-px bg-white/30" />
                    <span className="flex items-center" title="Opened">
                      <MailOpenedIcon
                        aria-label="Opened"
                        className="size-[18px] text-white/60"
                      />
                      <span className="pr-1 pl-1">{post.opened}</span>
                    </span>
                    <span aria-hidden className="h-3.5 w-px bg-white/30" />
                    <span className="flex items-center" title="Clicked">
                      <ClickLineIcon
                        aria-label="Clicked"
                        className="size-[18px] text-white/60"
                      />
                      <span className="pr-1 pl-1">{post.clicked}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-[12px] leading-4 font-normal text-white/50 sm:inline">
                      {post.date}
                    </span>
                    <Tag tone="cyan">Published</Tag>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.04),inset_0_0_0_1px_rgb(253_253_255/0.04)]" />
    </section>
  );
}
