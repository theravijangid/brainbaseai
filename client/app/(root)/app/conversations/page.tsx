"use client";

import { MessagesSquare, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

import { Page, PageHeader } from "@/components/app/AppShell";
import { EmptyState, StatusPill } from "@/components/app/primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useConversations, useConversationDetails, useUpdateConversationStatus } from "@/hooks/use-conversations";
import { useWorkspaces } from "@/hooks/use-workspaces";

const filters = ["All", "Open", "Resolved", "Needs attention"] as const;

export default function RoutePage(props: any) {
  return <ConversationsPage {...props} />;
}

function ConversationsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: workspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;

  const { data: list = [], isLoading } = useConversations(workspaceId || "", filter);
  const { data: active } = useConversationDetails(workspaceId || "", selected || "");
  const updateStatus = useUpdateConversationStatus(workspaceId || "");

  useEffect(() => {
    if (list.length > 0 && !selected) {
      setSelected(list[0].id);
    }
  }, [list, selected]);

  const handleStatusChange = (status: "open" | "resolved" | "attention") => {
    if (active) {
      updateStatus.mutate({ conversationId: active.id, status });
    }
  };

  return (
    <Page>
      <PageHeader title="Conversations" description="Customer conversations across all Support Agents" />

      <Tabs
        value={filter}
        onValueChange={(v) => {
          setFilter(v as (typeof filters)[number]);
          setSelected(null);
        }}
        className="mt-5"
      >
        <TabsList>
          {filters.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="mt-6 flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : list.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={MessagesSquare}
            title="Your customer conversations will appear here."
            description="Once your Support Agent is embedded and answering, every conversation lands in this inbox."
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="surface-panel divide-y divide-border overflow-hidden">
            {list.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={cn(
                  "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent",
                  c.id === selected && "bg-accent",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{c.customerName || "Visitor"}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                  </span>
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {c.messages && c.messages.length > 0 ? c.messages[0].content : "No messages"}
                </span>
                <span className="mt-1">
                  {c.status === "resolved" ? (
                    <StatusPill tone="success">Resolved</StatusPill>
                  ) : c.status === "open" ? (
                    <StatusPill tone="info">Open</StatusPill>
                  ) : (
                    <StatusPill tone="danger">Needs attention</StatusPill>
                  )}
                </span>
              </button>
            ))}
          </div>

          {active ? (
            <div className="surface-panel flex min-h-[420px] max-h-[70vh] flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{active.customerName || "Visitor"}</p>
                  <p className="text-xs text-muted-foreground">
                    {active.supportAgent?.name || "Support Agent"} · {formatDistanceToNow(new Date(active.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {active.status !== "resolved" && (
                    <button 
                      onClick={() => handleStatusChange("resolved")}
                      disabled={updateStatus.isPending}
                      className="text-xs font-medium text-success hover:underline disabled:opacity-50"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  {active.status === "resolved" ? (
                    <StatusPill tone="success">Resolved</StatusPill>
                  ) : active.status === "attention" ? (
                    <StatusPill tone="danger">Needs attention</StatusPill>
                  ) : (
                    <StatusPill tone="info">Open</StatusPill>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-surface p-4">
                {active.messages?.map((m) => (
                  <div key={m.id} className={cn("flex", m.role === "user" && "justify-end")}>
                    <p
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                        m.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm border border-border bg-elevated text-foreground",
                      )}
                    >
                      {m.content}
                    </p>
                  </div>
                ))}
              </div>
              <p className="border-t border-border bg-elevated px-4 py-2.5 text-[11px] text-muted-foreground">
                Customer transcripts never include internal source information.
              </p>
            </div>
          ) : (
            <div className="surface-panel flex min-h-[420px] items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Loading conversation...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
