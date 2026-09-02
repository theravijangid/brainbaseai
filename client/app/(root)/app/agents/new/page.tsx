"use client";

import { ArrowLeft, ArrowRight, Check, Loader2, AlertTriangle, Upload } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/app/AppShell";
import { SupportWidgetPanel } from "@/components/widget/SupportWidget";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useCreateAgent } from "@/hooks/use-agents";
import { useSources } from "@/hooks/use-sources";
import { useCompany } from "@/hooks/use-company";

const steps = ["Identity", "Instructions", "Knowledge", "Appearance", "Preview"];

export default function CreateAgentPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const { data: company } = useCompany();
  const { data: workspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id;

  const companyName = company?.name || workspaces?.[0]?.name || "our company";

  // Form State
  const [name, setName] = useState("Support Agent");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState(
    `You are a helpful support assistant for ${companyName}.\n\nAnswer using only the company knowledge available to you. Be concise, warm and specific. If you are unsure, say so and offer to connect the customer with the support team.`
  );
  const [scope, setScope] = useState("all");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi! How can I help you?");

  const { data: sources = [], isLoading: isLoadingSources } = useSources(workspaceId as string);
  const { mutate: createAgent, isPending: isCreating } = useCreateAgent(workspaceId as string);

  const hasNoSources = !isLoadingSources && sources.length === 0;
  const hasInvalidSelectedScope = scope === "selected" && selectedSourceIds.length === 0;

  const handleCreate = () => {
    if (hasNoSources) {
      toast.error("You need at least one knowledge source in your workspace before creating an agent.");
      return;
    }
    if (hasInvalidSelectedScope) {
      toast.error("Please select at least one knowledge source.");
      return;
    }

    createAgent({
      name,
      description,
      instructions,
      isPublic: true,
      knowledgeScope: {
        mode: scope,
        sourceIds: scope === 'selected' ? selectedSourceIds : undefined
      },
      branding: {
        primaryColor,
        welcomeMessage,
      }
    }, {
      onSuccess: (data) => {
        router.push(`/app/agents/${data.id}`);
      }
    });
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds(prev => 
      prev.includes(sourceId) ? prev.filter(id => id !== sourceId) : [...prev, sourceId]
    );
  };

  return (
    <Page className="max-w-4xl">
      <PageHeader title="Create Support Agent" description={`Step ${step + 1} of ${steps.length}`} />

      {hasNoSources ? (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            <span>No knowledge sources found. Your agent needs at least one source to answer questions.</span>
          </div>
          <Button asChild size="sm" variant="outline" className="h-8 shrink-0 text-xs border-amber-500/30">
            <Link href="/app/sources">
              <Upload className="mr-1.5 size-3.5" /> Add Sources
            </Link>
          </Button>
        </div>
      ) : null}

      <ol className="mt-6 flex items-center gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                i < step && "border-primary bg-primary text-primary-foreground",
                i === step && "border-primary text-primary",
                i > step && "border-border text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3" /> : i + 1}
            </span>
            <span className={cn("hidden text-xs sm:inline", i === step ? "font-medium" : "text-muted-foreground")}>
              {s}
            </span>
            {i < steps.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
          </li>
        ))}
      </ol>

      <div className="surface-panel mt-6 p-6">
        {step === 0 ? (
          <div className="space-y-5 animate-rise">
            <div className="grid gap-2">
              <Label htmlFor="name">Agent name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Front-line agent embedded on our website" />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4 animate-rise">
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                rows={10}
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: describe tone, escalation rules and anything the agent should never promise.
            </p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5 animate-rise">
            {hasNoSources ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6 text-center space-y-4">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">No knowledge sources available</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    You must upload files or add website sources before this agent can be created.
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link href="/app/sources">
                    <Upload className="mr-2 size-3.5" /> Add Knowledge Sources
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <RadioGroup value={scope} onValueChange={setScope} className="space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="all" id="all" className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">All workspace knowledge</span>
                      <span className="block text-xs text-muted-foreground">
                        New sources are included automatically.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
                    <RadioGroupItem value="selected" id="selected" className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium">Selected sources</span>
                      <span className="block text-xs text-muted-foreground">
                        Choose exactly what this agent can answer from.
                      </span>
                    </span>
                  </label>
                </RadioGroup>

                {scope === "selected" ? (
                  <div className="space-y-2 rounded-lg border border-border p-4">
                    {isLoadingSources ? (
                      <p className="text-sm text-muted-foreground py-2 text-center">Loading sources...</p>
                    ) : sources.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2 text-center">No sources available.</p>
                    ) : (
                      <>
                        {sources.map((s: any) => (
                          <label key={s.id} className="flex items-center gap-3 py-1.5 text-sm cursor-pointer">
                            <Checkbox 
                              id={s.id} 
                              checked={selectedSourceIds.includes(s.id)}
                              onCheckedChange={() => toggleSource(s.id)} 
                            />
                            <span className="flex-1 truncate">{s.name}</span>
                            <span className="text-xs uppercase text-muted-foreground">{s.type}</span>
                          </label>
                        ))}
                        {selectedSourceIds.length === 0 && (
                          <p className="pt-2 text-xs text-amber-500 font-medium">
                            Please select at least one source.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5 animate-rise sm:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="color">Primary color</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    id="color" 
                    type="color" 
                    value={primaryColor} 
                    onChange={e => setPrimaryColor(e.target.value)} 
                    className="h-10 w-14 cursor-pointer p-1" 
                  />
                  <Input 
                    value={primaryColor} 
                    onChange={e => setPrimaryColor(e.target.value)} 
                    placeholder="#2563eb" 
                    className="h-10 font-mono text-xs" 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="welcome">Welcome message</Label>
                <Input id="welcome" value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-center">
              <SupportWidgetPanel 
                className="h-[440px]" 
                title={name} 
                subtitle="Preview only" 
                primaryColor={primaryColor}
                welcomeMessage={welcomeMessage}
              />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="animate-rise text-center">
            <p className="text-sm font-medium">Customer Preview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Exactly what customers see. No citations or source names are ever shown here.
            </p>
            <div className="mt-6 flex justify-center">
              <SupportWidgetPanel 
                className="h-[500px]" 
                title={name} 
                subtitle="Preview only" 
                primaryColor={primaryColor}
                welcomeMessage={welcomeMessage}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || isCreating}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step === steps.length - 1 ? (
            <Button onClick={handleCreate} disabled={isCreating || hasNoSources || hasInvalidSelectedScope}>
              {isCreating && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create Agent"}
            </Button>
          ) : (
            <Button 
              onClick={() => setStep((s) => s + 1)} 
              disabled={isCreating || (step === 2 && (hasNoSources || hasInvalidSelectedScope))}
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </Page>
  );
}
