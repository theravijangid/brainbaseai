"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrainbaseWidget, useBrainbaseChat } from "@brainbaseai/react-widget";
import "@brainbaseai/react-widget/dist/index.css";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Globe,
  Key,
  Loader2,
  Play,
  Plus,
  RotateCw,
  Server,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Page, PageHeader } from "@/components/app/AppShell";
import { StatusPill } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgents } from "@/hooks/use-agents";
import { useWorkspaces } from "@/hooks/use-workspaces";

export default function TestWidgetPage() {
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;
  const { data: agents = [], isLoading: isAgentsLoading } = useAgents(workspaceId || "");

  const publicAgents = agents.filter((a: any) => a.isPublic);
  const firstPublicAgent = publicAgents[0];

  const [agentKey, setAgentKey] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [remountKey, setRemountKey] = useState(0);

  const isLoading = isWorkspacesLoading || (Boolean(workspaceId) && isAgentsLoading);
  const hasActiveAgents = publicAgents.length > 0;

  // Auto-select the first public agent key when query resolves
  useEffect(() => {
    if (firstPublicAgent?.publicKey && (!activeKey || !publicAgents.some((a: any) => `pk_live_${a.publicKey}` === activeKey))) {
      const fullKey = `pk_live_${firstPublicAgent.publicKey}`;
      setAgentKey(fullKey);
      setActiveKey(fullKey);
    }
  }, [firstPublicAgent?.publicKey, activeKey, publicAgents]);

  const handleApplyKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentKey.trim()) return;
    setActiveKey(agentKey.trim());
    setRemountKey((prev) => prev + 1);
  };

  const handleSelectAgent = (publicKey: string) => {
    const fullKey = `pk_live_${publicKey}`;
    setAgentKey(fullKey);
    setActiveKey(fullKey);
    setRemountKey((prev) => prev + 1);
  };

  return (
    <Page>
      <PageHeader
        title="Widget Test Sandbox"
        description="Live testing environment for @brainbaseai/react-widget connected to your backend API."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/developer">
                <ArrowLeft className="mr-1.5 size-3.5" /> Back to Docs
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/agents">
                <Bot className="mr-1.5 size-3.5" /> Manage Agents
              </Link>
            </Button>
          </div>
        }
      />

      {/* 1. Loading State */}
      {isLoading ? (
        <div className="mt-12 flex flex-col items-center justify-center space-y-3 py-16 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Checking workspace support agents...
          </p>
        </div>
      ) : !hasActiveAgents ? (
        /* 2. Gated State: No Active / Public Agents Configured */
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Active Agent Required
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    The live test sandbox is only available for workspaces with at least one active, public Support Agent configured.
                  </p>
                </div>
              </div>
              <StatusPill tone="warning">Setup Required</StatusPill>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  1
                </div>
                <h3 className="text-sm font-semibold text-foreground">Create Support Agent</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Configure instructions, knowledge scope, and branding inside your workspace.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  2
                </div>
                <h3 className="text-sm font-semibold text-foreground">Set Status to Public</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open the Agent Overview and toggle status from &quot;Draft&quot; to &quot;Public&quot; to generate an active public key.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5 space-y-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  3
                </div>
                <h3 className="text-sm font-semibold text-foreground">Test Live in Sandbox</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Return here to verify AI streaming responses, theme synchronization, and hook integrations.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 pt-6 border-t border-border">
              <Button asChild>
                <Link href="/app/agents">
                  <Plus className="mr-1.5 size-4" /> Create or Publish an Agent
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/app/developer">
                  View Developer Documentation <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Active Agents Configured: Full Interactive Sandbox */
        <div className="mt-6 space-y-6">
          {/* Preflight Checklist */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface-panel flex items-start gap-3 p-4">
              <Server className="size-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold">1. Backend API</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Express API active at <code className="font-mono text-foreground">https://brainbaseai.onrender.com</code>.
                </p>
              </div>
            </div>

            <div className="surface-panel flex items-start gap-3 p-4">
              <Bot className="size-5 shrink-0 text-success mt-0.5" />
              <div>
                <p className="text-sm font-semibold">2. Active Agents ({publicAgents.length})</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {publicAgents.length} public {publicAgents.length === 1 ? "agent" : "agents"} ready for live chat.
                </p>
              </div>
            </div>

            <div className="surface-panel flex items-start gap-3 p-4">
              <Key className="size-5 shrink-0 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-semibold">3. Scope</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Active key: <code className="font-mono text-foreground text-[11px]">{activeKey ? `${activeKey.slice(0, 16)}...` : "None"}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Key Selection Form */}
          <div className="surface-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Select Active Agent</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose one of your public agents below to test the widget live.
                </p>
              </div>
              <StatusPill tone="success">
                {publicAgents.length} Active {publicAgents.length === 1 ? "Agent" : "Agents"}
              </StatusPill>
            </div>

            {/* Agent Badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {publicAgents.map((a: any) => {
                const isSelected = activeKey === `pk_live_${a.publicKey}`;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelectAgent(a.publicKey)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-border bg-surface text-muted-foreground hover:bg-elevated hover:text-foreground"
                    }`}
                  >
                    <Bot className="size-3.5" />
                    <span>{a.name}</span>
                    <span className="size-1.5 rounded-full bg-success" />
                  </button>
                );
              })}
            </div>

            {/* Manual Key Input */}
            <form onSubmit={handleApplyKey} className="mt-4 flex max-w-xl gap-2">
              <Input
                value={agentKey}
                onChange={(e) => setAgentKey(e.target.value)}
                placeholder="pk_live_..."
                className="font-mono text-xs"
              />
              <Button type="submit" size="sm">
                <Play className="mr-1.5 size-3.5" /> Apply Key
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                title="Remount Widget"
                onClick={() => setRemountKey((p) => p + 1)}
              >
                <RotateCw className="size-3.5" />
              </Button>
            </form>
          </div>

          {/* Live Sandbox Test Tabs */}
          <Tabs defaultValue="dropin" className="mt-6">
            <TabsList>
              <TabsTrigger value="dropin" className="gap-2">
                <Cpu className="size-4" /> Drop-in Widget (Floating Bubble)
              </TabsTrigger>
              <TabsTrigger value="headless" className="gap-2">
                <Sparkles className="size-4" /> Headless Hook Demo
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Drop-in Widget */}
            <TabsContent value="dropin" className="mt-4">
              <div className="surface-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Drop-in Floating Widget</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Mounted with active key: <code className="font-mono text-primary">{activeKey}</code>
                    </p>
                  </div>
                  <StatusPill tone="success">Mounted on DOM</StatusPill>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-12 text-center">
                  <Bot className="size-10 text-primary mb-3" />
                  <h4 className="text-sm font-semibold">Look at the bottom right corner!</h4>
                  <p className="mt-1 max-w-md text-xs text-muted-foreground">
                    The native <code className="font-mono">BrainbaseWidget</code> floating launcher button is rendered at the bottom-right of this window. Click it to chat with your agent.
                  </p>
                </div>

                {/* Mount the actual widget */}
                {activeKey && (
                  <BrainbaseWidget
                    key={`widget-${remountKey}-${activeKey}`}
                    agentKey={activeKey}
                    apiUrl={process.env.NEXT_PUBLIC_API_URL}
                    defaultOpen={true}
                  />
                )}
              </div>
            </TabsContent>

            {/* Tab 2: Headless Hook Demo */}
            <TabsContent value="headless" className="mt-4">
              <div className="surface-panel p-6">
                <h3 className="text-base font-semibold">Headless Hook Live Preview</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  A custom chat UI rendered directly via <code className="font-mono">useBrainbaseChat({`{ agentKey: "${activeKey}" }`})</code>.
                </p>

                <div className="mt-6 flex justify-center">
                  <HeadlessChatPreview
                    key={`headless-${remountKey}-${activeKey}`}
                    agentKey={activeKey}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Page>
  );
}

function HeadlessChatPreview({ agentKey }: { agentKey: string }) {
  const { state, branding, messages, input, setInput, handleSubmit, isLoading } = useBrainbaseChat({
    agentKey,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  });

  const primaryColor = branding?.primaryColor || "#2563eb";

  return (
    <div className="flex h-[480px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-elevated shadow-xl">
      <header className="flex items-center gap-3 p-4 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="flex size-8 items-center justify-center rounded-full bg-white/20 font-bold text-xs">
          AI
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold">{branding?.title || "Support"}</h4>
          <p className="truncate text-xs opacity-90">{branding?.subtitle || "Replies instantly"}</p>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium">Headless</span>
      </header>

      {state === "loading" ? (
        <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
          Connecting session...
        </div>
      ) : state !== "chat" ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="size-8 text-destructive mb-2" />
          <p className="text-sm font-semibold">Session Status: {state}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ensure the agent is marked public and backend-api is running on https://brainbas...
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm text-white"
                    : "rounded-bl-sm border border-border bg-surface text-foreground"
                }`}
                style={m.role === "user" ? { backgroundColor: primaryColor } : undefined}
              >
                {m.parts?.map((p) => (p.type === "text" ? p.text : "")).join("") || (m as any).content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border bg-surface p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={state !== "chat"}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || state !== "chat"}
          style={{ backgroundColor: primaryColor }}
          className="flex size-7 items-center justify-center rounded-lg text-white disabled:opacity-50"
        >
          <Play className="size-3" />
        </button>
      </form>
    </div>
  );
}
