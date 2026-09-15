import Button from "@/components/_ui/button";
import ToolbarIcon from "@/public/assets/images/home/editor/topbar/toolbar.svg";
import ChevronIcon from "@/public/assets/images/home/editor/topbar/chevron.svg";
import SearchIcon from "@/public/assets/images/home/editor/topbar/search.svg";
import ControlIcon from "@/public/assets/images/home/editor/topbar/control.svg";
import PlayIcon from "@/public/assets/images/home/editor/topbar/play.svg";

export default function EditorTopbar() {
  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between gap-4 bg-[#111114] p-4">
      <div className="flex min-w-0 items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Toggle sidebar">
          <ToolbarIcon
            aria-hidden
            className="ease-power3-in-out size-5 -rotate-90 text-white/50 transition-colors duration-150 group-hover:text-white/80"
          />
        </Button>
        <div className="flex min-w-0 items-center gap-3">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center text-[14px] leading-6">
              <li className="hidden text-[#fcfdff]/30 text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32)] md:block">
                Automations
              </li>
              <li aria-hidden className="hidden md:block">
                <ChevronIcon className="size-6 text-[#fcfdff]/30" />
              </li>
              <li
                aria-current="page"
                className="truncate font-[550] text-white"
              >
                Workflow
              </li>
            </ol>
          </nav>
          <span className="relative flex h-6 shrink-0 items-center overflow-clip rounded-[8px] bg-[#551dff]/5 bg-[linear-gradient(177.3deg,rgb(255_255_255/0.02)_3.85%,rgb(255_255_255/0.014)_28%,rgb(255_255_255/0.008)_49%,rgb(255_255_255/0)_75%)] px-1.5 text-[12px] leading-6 font-[550] text-[#7f59f0] shadow-[0_1px_2px_rgb(0_0_0/0.08),0_1px_0_rgb(0_0_0/0.12),0_0_0_1px_rgb(0_0_0/0.16),inset_0_1px_0_rgb(255_255_255/0.01),inset_0_0_0_1px_rgb(253_253_255/0.04)] text-shadow-[0_-1px_0.25px_rgb(0_0_0/0.32),0_4px_6px_rgb(127_89_240/0.4)]">
            Draft
          </span>
        </div>
      </div>

      <span className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-[14px] leading-6 font-[550] whitespace-nowrap text-[#fcfdff]/90 lg:block">
        🐝 Buzzing Your Inbox
      </span>

      <div className="flex shrink-0 items-center gap-3">
        <Button variant="field" size="field" className="hidden md:inline-flex">
          <SearchIcon aria-hidden className="size-5 text-white/40" />
          <span className="pr-1">Search</span>
        </Button>
        <Button variant="field" size="field" className="hidden md:inline-flex">
          <ControlIcon aria-hidden className="size-5 text-white/60" />
          <span className="pr-1">Control</span>
        </Button>
        <Button variant="accent" size="field">
          <PlayIcon aria-hidden className="size-5 text-white/80" />
          <span className="pr-1">Preview</span>
        </Button>
      </div>
    </header>
  );
}
