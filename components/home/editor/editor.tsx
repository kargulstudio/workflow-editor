import EditorSidebar from "./editor-sidebar";
import EditorTopbar from "./editor-topbar";
import EditorTabs from "./editor-tabs";
import WorkflowCanvas from "./workflow/workflow-canvas";

const divider =
  "relative h-1 shrink-0 bg-[#111114] after:absolute after:inset-x-0 after:top-[1.25px] after:h-[1.5px] after:bg-black/32 after:shadow-[0_1px_0_rgb(83_86_101/0.06),0_0.5px_0_rgb(83_86_101/0.06)]";

export default function Editor() {
  return (
    <section
      id="editor"
      className="relative z-0 flex h-dvh min-h-[560px] bg-[#0c0c0f]"
    >
      <EditorSidebar />
      <div className="flex min-w-0 flex-1 p-1.5">
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[10px] bg-[#111114] shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_0_2px_rgb(0_0_0/0.3)]">
          <EditorTopbar />
          <div aria-hidden className={divider} />
          <EditorTabs />
          <div aria-hidden className={divider} />
          <WorkflowCanvas />
          <div className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] shadow-[inset_0_1px_0_rgb(255_255_255/0.035),inset_0_0_0_1px_rgb(255_255_255/0.02)]" />
        </div>
      </div>
    </section>
  );
}
