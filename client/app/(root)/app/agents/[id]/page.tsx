"use client";

import { Bot, Copy, Plus, ShieldCheck, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { Page, PageHeader } from "@/components/app/AppShell";
import { MetricCard, StatusPill, EmptyState } from "@/components/app/primitives";
import { SupportWidgetPanel } from "@/components/widget/SupportWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useAgent, useUpdateAgent } from "@/hooks/use-agents";
import { useSources } from "@/hooks/use-sources";

export default function AgentDetailPage() {
  const { id } = useParams();
  
  const { data: workspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;

  const { data: agent, isLoading: isLoadingAgent } = useAgent(workspaceId as string, id as string);
  const { data: sources = [], isLoading: isLoadingSources } = useSources(workspaceId as string);
  
  const { mutate: updateAgent, isPending: isUpdating } = useUpdateAgent(workspaceId as string, id as string);

  const [origins, setOrigins] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Form states
  const [instructions, setInstructions] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  useEffect(() => {
    if (agent) {
      setInstructions(agent.instructions || "");
      setPrimaryColor(agent.branding?.primaryColor || "#2563eb");
      setWelcomeMessage(agent.branding?.welcomeMessage || "Hi! How can I help you?");
      setSelectedSourceIds(agent.knowledgeScope?.sourceIds || []);
    }
  }, [agent]);

  if (isLoadingAgent || !agent) {
    return (
      <Page>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </Page>
    );
  }

  const snippet = `// 1. Install packages
// npm install @brainbaseai/react-widget @ai-sdk/react ai

// 2. Import and use the widget
import { BrainbaseWidget } from '@brainbaseai/react-widget';
import '@brainbaseai/react-widget/dist/index.css';

export default function App() {
  return (
    <BrainbaseWidget publishableKey="bb_live_${agent.publicKey}" />
  );
}`;

  const handleSaveInstructions = () => {
    updateAgent({ instructions });
  };

  const handleSaveAppearance = () => {
    updateAgent({ branding: { primaryColor, welcomeMessage } });
  };

  const toggleSource = (sourceId: string) => {
    const newSourceIds = selectedSourceIds.includes(sourceId) 
      ? selectedSourceIds.filter(i => i !== sourceId)
      : [...selectedSourceIds, sourceId];
    
    setSelectedSourceIds(newSourceIds);
    updateAgent({ 
      knowledgeScope: { 
        mode: 'selected', 
        sourceIds: newSourceIds 
      } 
    });
  };

  const togglePublicStatus = () => {
    updateAgent({ isPublic: !agent.isPublic });
  };

  return (
    <Page>
      <PageHeader
        title={agent.name}
        description={agent.description || "Support Agent"}
        actions={
          <>
            <Button size="sm">Embed Agent</Button>
          </>
        }
      />

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex-wrap">
          {["overview", "knowledge", "instructions", "appearance", "conversations", "analytics", "integrate"].map(
            (t) => (
              <TabsTrigger key={t} value={t} className="capitalize">
                {t}
              </TabsTrigger>
            ),
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Status" value={agent.isPublic ? "Live" : "Paused"} hint="Public on website" icon={Bot} />
            <MetricCard label="Knowledge" value={agent.knowledgeScope?.mode === 'selected' ? 'Selected Sources' : 'All Workspace'} hint={`Workspace: ${workspaces?.[0]?.name}`} />
            <MetricCard label="Conversations" value="0" hint="Feature coming soon" />
            <MetricCard label="Created" value={formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true })} />
          </div>
          <div className="surface-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {agent.isPublic ? (
                <StatusPill tone="success">Public</StatusPill>
              ) : (
                <StatusPill tone="neutral">Paused</StatusPill>
              )}
              <span className="text-sm text-muted-foreground">
                {agent.isPublic ? "This agent is currently active and answering customers." : "This agent is currently disabled."}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={togglePublicStatus} disabled={isUpdating}>
              {agent.isPublic ? "Disable agent" : "Enable agent"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-5">
          <div className="surface-panel p-5">
            {agent.knowledgeScope?.mode === 'all' ? (
              <div className="text-center py-4">
                <p className="text-sm font-medium">All Workspace Knowledge</p>
                <p className="text-xs text-muted-foreground mt-1">This agent has access to all {sources.length} sources in the workspace.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Selected Sources</p>
                {isLoadingSources ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">Loading sources...</p>
                ) : sources.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">No sources available.</p>
                ) : (
                  <div className="space-y-1 divide-y divide-border">
                    {sources.map((s: any) => (
                      <label key={s.id} className="flex items-center gap-3 py-3 text-sm cursor-pointer">
                        <Checkbox 
                          id={s.id} 
                          checked={selectedSourceIds.includes(s.id)}
                          onCheckedChange={() => toggleSource(s.id)}
                          disabled={isUpdating}
                        />
                        <span className="flex-1 truncate">{s.name}</span>
                        <span className="text-xs uppercase text-muted-foreground">{s.type}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {agent.knowledgeScope?.mode === 'all' && (
            <p className="mt-3 text-xs text-muted-foreground">
              This agent uses all workspace sources. New sources are included automatically.
            </p>
          )}
        </TabsContent>

        <TabsContent value="instructions" className="mt-5">
          <div className="surface-panel space-y-3 p-5">
            <Label htmlFor="ins">Instructions</Label>
            <Textarea
              id="ins"
              rows={10}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Button size="sm" onClick={handleSaveInstructions} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="surface-panel space-y-4 p-5">
              <div className="grid gap-2">
                <Label htmlFor="welcome">Welcome message</Label>
                <Input id="welcome" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pc">Primary color</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="pc" 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="h-10 w-14 cursor-pointer p-1" 
                  />
                  <Input 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    placeholder="#2563eb" 
                    className="h-10 font-mono text-xs" 
                  />
                </div>
              </div>
              <Button size="sm" onClick={handleSaveAppearance} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Save appearance
              </Button>
            </div>
            <div className="flex justify-center">
              <SupportWidgetPanel 
                className="h-[440px]" 
                title={agent.name} 
                subtitle="Preview"
                primaryColor={primaryColor}
                welcomeMessage={welcomeMessage}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="mt-5">
          <div className="surface-panel">
            <EmptyState
              icon={Bot}
              title="No conversations yet"
              description="When customers talk to this agent, their conversations will appear here."
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-5">
          <div className="surface-panel">
             <EmptyState
              icon={Bot}
              title="Analytics Unavailable"
              description="Analytics API is missing. This feature will be planned later."
            />
          </div>
        </TabsContent>

        <TabsContent value="integrate" className="mt-5 space-y-5">
          <div className="surface-panel p-5">
            <h2 className="text-sm font-semibold">React Integration</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add this to your React or Next.js app.</p>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-surface p-3">
              <pre className="flex-1 overflow-x-auto font-mono text-xs leading-relaxed">{snippet}</pre>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(snippet);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
              >
                <Copy className="size-3.5" /> {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="surface-panel p-5 opacity-50">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold">Allowed origins</h2>
              <StatusPill tone="neutral">Coming soon</StatusPill>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Only approved websites can load this Support Agent.
            </p>
            <ul className="mt-4 space-y-2">
              {origins.map((o) => (
                <li key={o} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="font-mono text-xs">{o}</span>
                  <button
                    aria-label={`Remove ${o}`}
                    onClick={() => setOrigins((prev) => prev.filter((p) => p !== o))}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    disabled
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem("origin") as HTMLInputElement);
                if (input.value) setOrigins((p) => [...p, input.value]);
                input.value = "";
              }}
            >
              <Input name="origin" placeholder="https://yourdomain.com" aria-label="Add allowed origin" disabled />
              <Button type="submit" variant="outline" size="sm" disabled>
                <Plus className="size-3.5" /> Add
              </Button>
            </form>
          </div>

          <div className="surface-panel p-5">
            <p className="text-sm font-medium">Customer Preview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This is exactly what customers see. Citations and source names are never shown.
            </p>
            <div className="mt-4 flex justify-center">
              <SupportWidgetPanel 
                className="h-[460px]" 
                title={agent.name}
                agentId={agent.id}
                workspaceId={workspaceId}
                primaryColor={primaryColor}
                welcomeMessage={welcomeMessage}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
