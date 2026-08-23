"use client";

import Link from "next/link";
import { Quote, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useSignIn } from "@clerk/nextjs";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" aria-label="BrainbaseAI home">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-10">
          {children}
        </div>
      </div>

      <aside className="relative hidden flex-col justify-between border-l border-border bg-surface p-10 lg:flex">
        <div className="pointer-events-none absolute inset-0 hero-grid" aria-hidden />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary" /> Company Brain
          </span>
          <p className="mt-6 max-w-md font-display text-2xl font-semibold tracking-tight">
            "Our support team stopped searching for documents and started answering customers."
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Head of Support, Acme Inc.</p>
        </div>
        <div className="relative space-y-3">
          <div className="surface-panel p-4">
            <p className="text-sm">Your refund policy allows requests within 14 days of delivery.</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground">
              <Quote className="size-3" /> Refund Policy.pdf · §3 · p.4
            </span>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Knowledge is isolated per workspace.
          </p>
        </div>
      </aside>
    </div>
  );
}
