import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "neutral" | "info";
  children: ReactNode;
}) {
  const Icon =
    tone === "success" ? CheckCircle2 : tone === "warning" ? Loader2 : tone === "danger" ? XCircle : Circle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        tone === "warning" && "border-warning/40 bg-warning/10 text-warning-foreground",
        tone === "danger" && "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "info" && "border-info/30 bg-info/10 text-info",
        tone === "neutral" && "border-border bg-muted text-muted-foreground",
      )}
    >
      <Icon className={cn("size-3", tone === "warning" && "animate-spin")} aria-hidden />
      {children}
    </span>
  );
}

export function UsageMeter({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit?: number | string | "unlimited";
  unit?: string;
}) {
  const isUnlimited = limit === "unlimited" || limit === "Unlimited" || limit === -1 || limit === undefined || limit === null;
  const numLimit = typeof limit === "number" ? limit : typeof limit === "string" && !isNaN(Number(limit)) ? Number(limit) : null;
  const pct = isUnlimited || !numLimit || numLimit <= 0 ? 0 : Math.min(100, Math.round((used / numLimit) * 100));
  const state = !isUnlimited && numLimit && pct >= 100 ? "exhausted" : !isUnlimited && numLimit && pct >= 80 ? "near" : "ok";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {used.toLocaleString()} / {isUnlimited ? "Unlimited" : (numLimit?.toLocaleString() ?? "∞")} {unit}
        </span>
      </div>
      {!isUnlimited && numLimit ? (
        <Progress
          value={pct}
          className={cn("mt-2 h-1.5", state === "near" && "[&>div]:bg-warning", state === "exhausted" && "[&>div]:bg-destructive")}
        />
      ) : null}
      {state !== "ok" ? (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-xs",
            state === "near" ? "text-muted-foreground" : "text-destructive",
          )}
        >
          <AlertTriangle className="size-3" aria-hidden />
          {state === "near" ? `You're close to your ${label.toLowerCase()} limit.` : `${label} limit reached.`}
        </p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-elevated">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function UpgradeCallout({
  message,
  buttonText = "Upgrade to Pro",
  href = "/app/billing",
}: {
  message: string;
  buttonText?: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary-soft p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-foreground">{message}</p>
      <Button asChild size="sm">
        <Link href={href}>{buttonText}</Link>
      </Button>
    </div>
  );
}

