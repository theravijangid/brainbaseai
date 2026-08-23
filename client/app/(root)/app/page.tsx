"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bot, BrainCircuit, FileStack, MessagesSquare, Plus, Sparkles, Loader2 } from "lucide-react";

import { Page, PageHeader } from "@/components/app/AppShell";
import { MetricCard, UpgradeCallout, UsageMeter } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useUsage } from "@/hooks/use-company";
import { useWorkspaces, useWorkspaceAnalytics } from "@/hooks/use-workspaces";
import { useAgents } from "@/hooks/use-agents";


export default function RoutePage(props: any) {
  return <OverviewPage {...props} />;
}


function OverviewPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const defaultWorkspace = workspaces?.[0];
  
  const { data: usageData, isLoading: isUsageLoading } = useUsage();
  const { data: analytics, isLoading: isAnalyticsLoading } = useWorkspaceAnalytics(defaultWorkspace?.id || '');
  const { data: agents = [], isLoading: isAgentsLoading } = useAgents(defaultWorkspace?.id || '');

  const usage = usageData?.usage;
  const isNearLimit = useMemo(() => {
    if (!usage) return false;
    const metrics = [
      usage.workspaces,
      usage.sources,
      usage.agents,
      usage.knowledgeChat,
      usage.supportConversations,
    ];
    return metrics.some((m) => {
      if (!m || !m.limit || m.limit === "unlimited" || m.limit === "Unlimited" || m.limit === -1) return false;
      const numLimit = typeof m.limit === "number" ? m.limit : Number(m.limit);
      if (isNaN(numLimit) || numLimit <= 0) return false;
      return m.used / numLimit >= 0.8;
    });
  }, [usage]);

  const recommendedSteps = useMemo(() => {
    const steps: { t: string; d: string; to: string }[] = [];
    const hasSources = (analytics?.sources || 0) > 0 || (defaultWorkspace?.sources?.length || 0) > 0;
    const hasAgents = agents.length > 0 || (analytics?.agents || 0) > 0;
    const firstAgent = agents[0];

    if (!hasSources) {
      steps.push({
        t: "Add your first knowledge source",
        d: "Upload PDFs, connect website URLs, or add YouTube video transcripts.",
        to: "/app/sources",
      });
    } else {
      steps.push({
        t: "Explore Company Brain",
        d: "Test semantic search and multi-source RAG across your approved sources.",
        to: "/app/brain",
      });
    }

    if (!hasAgents) {
      steps.push({
        t: "Create an AI Support Agent",
        d: "Configure an agent to automatically answer customer queries with citations.",
        to: "/app/agents/new",
      });
    } else if (firstAgent) {
      steps.push({
        t: `Configure & Embed ${firstAgent.name}`,
        d: "Get your embed snippet and configure allowed website domains.",
        to: `/app/agents/${firstAgent.id}`,
      });
    }

    steps.push({
      t: "Test Widget Integration",
      d: "Preview your embedded AI support widget in an interactive sandbox.",
      to: "/app/test-widget",
    });

    return steps;
  }, [analytics, defaultWorkspace?.sources, agents]);

  if (!isUserLoaded || isWorkspacesLoading || isUsageLoading || isAnalyticsLoading || isAgentsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const firstName = user?.firstName || "there";
  const planName = usageData?.plan?.name || "Free";
  const planId = (usageData?.plan?.id || usageData?.plan?.name || "free").toLowerCase();
  const isFreePlan = planId.includes("free");
  const isProPlan = planId.includes("pro");

  return (
    <Page>
      <PageHeader
        title={`Good morning, ${firstName}`}
        description={`${defaultWorkspace?.name || "Workspace"} · ${planName} plan`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/app/sources">
                <Plus className="size-4" /> Add Source
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/app/agents/new">
                <Plus className="size-4" /> Create Support Agent
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/app/brain">
                <Sparkles className="size-4" /> Ask Company Brain
              </Link>
            </Button>
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Knowledge sources" value={analytics?.sources?.toString() || "0"} hint="Total sources" icon={FileStack} />
        <MetricCard label="Support agents" value={analytics?.agents?.toString() || "0"} hint="Active agents" icon={Bot} />
        <MetricCard label="Conversations (30d)" value={analytics?.aiConversations?.toString() || "0"} hint="Last 30 days" icon={MessagesSquare} />
        <MetricCard label="Knowledge chat (30d)" value={analytics?.knowledgeChatUsage?.toString() || "0"} hint="Messages against Company Brain" icon={BrainCircuit} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="surface-panel space-y-5 p-5 lg:col-span-2" aria-labelledby="usage-heading">
          <div className="flex items-center justify-between">
            <h2 id="usage-heading" className="text-sm font-semibold">
              Plan usage · {planName}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/billing">View billing</Link>
            </Button>
          </div>
          <UsageMeter label="Workspaces" used={usage?.workspaces?.used || 0} limit={usage?.workspaces?.limit} />
          <UsageMeter label="Sources" used={usage?.sources?.used || 0} limit={usage?.sources?.limit} />
          <UsageMeter label="Active agents" used={usage?.agents?.used || 0} limit={usage?.agents?.limit} />
          <UsageMeter label="Knowledge Chat" used={usage?.knowledgeChat?.used || 0} limit={usage?.knowledgeChat?.limit} unit="msgs" />
          <UsageMeter
            label="Support conversations"
            used={usage?.supportConversations?.used || 0}
            limit={usage?.supportConversations?.limit}
          />
          {isFreePlan && isNearLimit && (
            <UpgradeCallout 
              message="You're close to your Free plan limits. Pro adds 50 sources per workspace and 2,000 conversations a month." 
              buttonText="Upgrade to Pro"
              href="/app/billing"
            />
          )}
          {isProPlan && isNearLimit && (
            <UpgradeCallout 
              message="You're close to your Pro plan limits. Enterprise provides unlimited workspaces and dedicated support." 
              buttonText="Upgrade Plan"
              href="/app/billing"
            />
          )}
          {!isFreePlan && !isProPlan && isNearLimit && (
            <UpgradeCallout 
              message="You're reaching your allocated plan limits. Manage your subscription to adjust quotas." 
              buttonText="Manage Billing"
              href="/app/billing"
            />
          )}
        </section>

        <section className="surface-panel p-5" aria-labelledby="next-heading">
          <h2 id="next-heading" className="text-sm font-semibold">
            Recommended next steps
          </h2>
          <ol className="mt-4 space-y-3">
            {recommendedSteps.map((s, i) => (
              <li key={s.t} className="flex gap-3 rounded-lg border border-border p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <Link href={s.to} className="text-sm font-medium hover:underline">
                    {s.t}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>

        </section>
      </div>
    </Page>
  );
}

