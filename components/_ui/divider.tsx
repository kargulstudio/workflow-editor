import { cn } from "@/lib/utils";

export default function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-0.5 shrink-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.32)_0,rgb(0_0_0/0.32)_1.5px,rgb(83_86_101/0.06)_1.5px)]",
        className,
      )}
    />
  );
}
