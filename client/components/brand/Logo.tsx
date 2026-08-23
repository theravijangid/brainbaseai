import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M12 4.5c-2 0-3.4 1.2-3.7 2.8C6.7 7.6 5.5 8.9 5.5 10.6c0 1 .4 1.9 1.1 2.5-.5.6-.8 1.3-.8 2.1 0 1.9 1.6 3.3 3.6 3.3.9 0 1.8-.3 2.6-.9" />
        <path d="M12 4.5c2 0 3.4 1.2 3.7 2.8 1.6.3 2.8 1.6 2.8 3.3 0 1-.4 1.9-1.1 2.5.5.6.8 1.3.8 2.1 0 1.9-1.6 3.3-3.6 3.3-.9 0-1.8-.3-2.6-.9" />
        <path d="M12 4.5v14" />
      </svg>
    </span>
  );
}

export function Logo({ className, subtle }: { className?: string; subtle?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-[15px] font-semibold tracking-tight",
          subtle && "text-muted-foreground",
        )}
      >
        BrainbaseAI
      </span>
    </span>
  );
}
