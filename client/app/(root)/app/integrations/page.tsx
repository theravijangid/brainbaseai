"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  Check, 
  Code2, 
  Copy, 
  ExternalLink, 
  Globe, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  Loader2 
} from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { integrations } from "@/lib/brainbase-data";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useAgents } from "@/hooks/use-agents";

const categories = ["Website", "Knowledge", "Communication", "Customer Support", "Automation"] as const;

export default function IntegrationsPage() {
  const { data: workspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;
  const { data: agents = [], isLoading: isLoadingAgents } = useAgents(workspaceId as string);

  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Set default selected agent when data loads
  const activeAgent = agents.find((a: any) => a.id === selectedAgentId) || agents[0];
  const agentKey = activeAgent?.publicKey ? `bb_live_${activeAgent.publicKey}` : "bb_live_your_public_key";

  const copyText = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const reactSnippet = `// 1. Install packages
npm install @brainbaseai/react-widget @ai-sdk/react ai

// 2. Import and render the widget
import { BrainbaseWidget } from '@brainbaseai/react-widget';
import '@brainbaseai/react-widget/dist/index.css';

export default function App() {
  return (
    <BrainbaseWidget publishableKey="${agentKey}" />
  );
}`;

  const htmlSnippet = `<!-- Add before the closing </body> tag -->
<script
  src="https://unpkg.com/@brainbaseai/react-widget/dist/embed.js"
  data-agent-key="${agentKey}"
  async
></script>`;

  const headlessSnippet = `import { useBrainbaseChat } from '@brainbaseai/react-widget';

export function CustomChat() {
  const { messages, input, setInput, handleSubmit, isLoading } = useBrainbaseChat({
    publishableKey: "${agentKey}"
  });

  return (
    <div>{/* Your custom UI */}</div>
  );
}`;

  const handleConnectClick = (integration: (typeof integrations)[0]) => {
    if (integration.name === "Website Embed") {
      setEmbedModalOpen(true);
    } else {
      toast.info(`${integration.name} integration is currently in development and coming soon!`);
    }
  };

  return (
    <Page>
      <PageHeader
        title="Integrations"
        description="Connect BrainbaseAI to the places your knowledge and customers already are"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/developer">
              <Code2 className="mr-1.5 size-3.5" /> Developer Docs
            </Link>
          </Button>
        }
      />

      <p className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0" />
        Connected tools can only access knowledge inside this workspace.
      </p>

      <div className="mt-6 space-y-10">
        {categories.map((cat) => {
          const items = integrations.filter((i) => i.category === cat);
          if (!items.length) return null;
          return (
            <section key={cat} aria-labelledby={`cat-${cat}`}>
              <h2 id={`cat-${cat}`} className="text-sm font-semibold">
                {cat}
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((i) => (
                  <div key={i.name} className="surface-panel flex flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface font-display text-sm font-semibold">
                        {i.name.slice(0, 1)}
                      </span>
                      {i.available ? (
                        <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{i.name}</h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{i.description}</p>
                    <Button
                      size="sm"
                      className="mt-4 cursor-pointer"
                      variant={i.available ? "default" : "outline"}
                      onClick={() => handleConnectClick(i)}
                    >
                      {i.available ? "Connect" : "Coming Soon"}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Website Embed Dialog */}
      <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Globe className="size-4" />
              </span>
              <DialogTitle>Website Embed Integration</DialogTitle>
            </div>
            <DialogDescription>
              Embed your AI Support Agent directly into your website or React application.
            </DialogDescription>
          </DialogHeader>

          {isLoadingAgents ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : agents.length === 0 ? (
            <div className="my-4 rounded-xl border border-border bg-surface p-6 text-center space-y-4">
              <Bot className="mx-auto size-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">No Support Agents Created</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You need to create a support agent first to generate your live embed widget snippet.
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/app/agents/new" onClick={() => setEmbedModalOpen(false)}>
                  <Sparkles className="mr-2 size-3.5" /> Create Support Agent
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {/* Agent Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Select Support Agent
                </label>
                <Select
                  value={activeAgent?.id}
                  onValueChange={(val) => setSelectedAgentId(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent: any) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{agent.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({agent.isPublic ? "Live" : "Paused"})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Embed Code Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Embed Code Snippets
                </label>
                <Tabs defaultValue="react" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="react">React / Next.js</TabsTrigger>
                    <TabsTrigger value="html">HTML Script Tag</TabsTrigger>
                    <TabsTrigger value="headless">Headless Hook</TabsTrigger>
                  </TabsList>

                  <TabsContent value="react" className="mt-3 space-y-2">
                    <div className="relative rounded-lg border border-border bg-surface p-3.5">
                      <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
                        {reactSnippet}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute right-2.5 top-2.5 h-7 px-2 text-xs"
                        onClick={() => copyText(reactSnippet, "react")}
                      >
                        {copiedKey === "react" ? (
                          <>
                            <Check className="mr-1 size-3 text-success" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 size-3" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="html" className="mt-3 space-y-2">
                    <div className="relative rounded-lg border border-border bg-surface p-3.5">
                      <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
                        {htmlSnippet}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute right-2.5 top-2.5 h-7 px-2 text-xs"
                        onClick={() => copyText(htmlSnippet, "html")}
                      >
                        {copiedKey === "html" ? (
                          <>
                            <Check className="mr-1 size-3 text-success" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 size-3" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="headless" className="mt-3 space-y-2">
                    <div className="relative rounded-lg border border-border bg-surface p-3.5">
                      <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
                        {headlessSnippet}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute right-2.5 top-2.5 h-7 px-2 text-xs"
                        onClick={() => copyText(headlessSnippet, "headless")}
                      >
                        {copiedKey === "headless" ? (
                          <>
                            <Check className="mr-1 size-3 text-success" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 size-3" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/app/agents/${activeAgent?.id}`} onClick={() => setEmbedModalOpen(false)}>
                      <Bot className="mr-1.5 size-3.5" /> Agent Settings
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/app/test-widget" onClick={() => setEmbedModalOpen(false)}>
                      <Play className="mr-1.5 size-3.5" /> Test Playground
                    </Link>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/app/developer" onClick={() => setEmbedModalOpen(false)}>
                    <Code2 className="mr-1.5 size-3.5" /> Full API Docs <ExternalLink className="ml-1 size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}
