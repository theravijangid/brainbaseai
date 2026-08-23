"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Page, PageHeader } from "@/components/app/AppShell";
import { MetricCard } from "@/components/app/primitives";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaces, useWorkspaceAnalytics } from "@/hooks/use-workspaces";
import { Loader2 } from "lucide-react";

export function AnalyticsPage() {
  const [range, setRange] = useState("30");
  const { data: workspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id || "";

  const { data: analytics, isLoading } = useWorkspaceAnalytics(workspaceId, parseInt(range));

  return (
    <Page>
      <PageHeader
        title="Analytics"
        description={`${workspaces?.[0]?.name || "Workspace"} · Knowledge & Conversation Insights`}
        actions={
          <Tabs value={range} onValueChange={setRange}>
            <TabsList>
              <TabsTrigger value="7">7 days</TabsTrigger>
              <TabsTrigger value="30">30 days</TabsTrigger>
              <TabsTrigger value="90">90 days</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics…</p>
        </div>
      ) : analytics ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total conversations" value={analytics.totalConversations.toLocaleString()} hint="All time tracked" />
            <MetricCard label="AI conversations" value={analytics.aiConversations.toLocaleString()} hint="Handled by agents" />
            <MetricCard label="Knowledge Chat usage" value={analytics.knowledgeChatUsage.toLocaleString()} hint="Internal messages" />
            <MetricCard label="Support Agent usage" value={analytics.supportAgentUsage.toLocaleString()} hint="Agents with activity" />
          </div>

      <div className="surface-panel mt-4 p-5">
        <h2 className="text-sm font-semibold">Conversations over time</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.conversationTrend} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="kn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="conversations"
                stroke="var(--color-chart-1)"
                fill="url(#cv)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="knowledge"
                stroke="var(--color-chart-2)"
                fill="url(#kn)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="surface-panel p-5">
          <h2 className="text-sm font-semibold">Agent performance</h2>
          <div className="mt-4 space-y-3">
            {analytics.agentPerformance.length > 0 ? (
              analytics.agentPerformance.map((a) => (
                <div key={a.n}>
                  <div className="flex justify-between text-sm">
                    <span>{a.n}</span>
                    <span className="font-mono text-xs text-muted-foreground">{a.v}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(a.v / Math.max(...analytics.agentPerformance.map(ap => ap.v), 1)) * 100}%` }}
                      aria-hidden
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No agent activity found in this period.</p>
            )}
          </div>
        </div>

        <div className="surface-panel flex flex-col items-center justify-center p-5 text-center">
          <h2 className="text-sm font-semibold">Resolution rate</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Resolution tracking isn't available yet. It will appear here once conversation outcomes are
            recorded.
          </p>
        </div>
      </div>
        </>
      ) : null}
    </Page>
  );
}
