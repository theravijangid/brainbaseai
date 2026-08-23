"use client";

import Link from "next/link";
import { Bot, MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Page, PageHeader } from "@/components/app/AppShell";
import { EmptyState, StatusPill } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAgents } from "@/hooks/use-agents";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useUsage } from "@/hooks/use-company";

export default function AgentsPage() {
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;

  const { data: agents = [], isLoading: isLoadingAgents } = useAgents(workspaceId as string);
  const { data: usageData } = useUsage();
  const planName = usageData?.plan?.name || "Free";

  const isLoading = isLoadingWorkspaces || isLoadingAgents;

  return (
    <Page>
      <PageHeader
        title="Support Agents"
        description={`${agents.length} active agent${agents.length === 1 ? '' : 's'} · ${planName} plan`}
        actions={
          <Button asChild size="sm">
            <Link href="/app/agents/new">
              <Plus className="size-4" /> Create Agent
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="mt-6 flex h-40 items-center justify-center rounded-xl border border-border bg-surface">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : agents.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Bot}
            title="Turn your knowledge into an AI support agent."
            description="Create an agent, choose what it can answer from, and embed it on your website."
            action={
              <Button asChild>
                <Link href="/app/agents/new">Create Support Agent</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {agents.map((a: any) => (
            <div key={a.id} className="surface-panel p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                  <Bot className="size-5 text-primary" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/app/agents/${a.id}`}
                      className="font-medium hover:underline"
                    >
                      {a.name}
                    </Link>
                    {a.isPublic ? (
                      <StatusPill tone="success">Live</StatusPill>
                    ) : (
                      <StatusPill tone="neutral">Paused</StatusPill>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">{a.description || 'Support Agent'}</p>
                </div>
                <dl className="grid grid-cols-3 gap-6 text-sm sm:w-80">
                  <div>
                    <dt className="text-[11px] uppercase text-muted-foreground">Knowledge</dt>
                    <dd className="truncate">{a.knowledgeScope?.mode === 'selected' ? 'Selected' : 'All Workspace'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-muted-foreground">Conversations</dt>
                    <dd>0</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-muted-foreground">Created</dt>
                    <dd className="truncate">
                      {a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : 'Just now'}
                    </dd>
                  </div>
                </dl>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/app/agents/${a.id}`}>
                      Open
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${a.name}`}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/app/agents/${a.id}`}>Edit</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
