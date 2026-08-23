"use client";

import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { useWorkspaces, useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/use-workspaces";
import { useAgents } from "@/hooks/use-agents";

export function SettingsClient() {
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  
  const updateCompany = useUpdateCompany();
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const defaultWorkspace = workspaces?.[0];
  const { data: agents, isLoading: isAgentsLoading } = useAgents(defaultWorkspace?.id || '');

  const firstAgent = agents?.[0];

  if (isCompanyLoading || isWorkspacesLoading) {
    return (
      <Page>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </Page>
    );
  }

  const handleCompanySave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    updateCompany.mutate(data);
  };

  const handleWorkspaceSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!defaultWorkspace) return;
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    updateWorkspace.mutate({ id: defaultWorkspace.id, data });
  };

  return (
    <Page>
      <PageHeader title="Settings" description={`${company?.name || "Company"} · ${defaultWorkspace?.name || "Workspace"}`} />

      <Tabs defaultValue="company" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="developer">API / Developer</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-5">
          <form onSubmit={handleCompanySave} className="surface-panel max-w-2xl space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="cname">Company name</Label>
                <Input id="cname" name="name" defaultValue={company?.name || ''} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cweb">Website</Label>
                <Input id="cweb" name="website" defaultValue={company?.website || ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cind">Industry</Label>
                <Input id="cind" name="industry" defaultValue={company?.industry || ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="csize">Company size</Label>
                <Input id="csize" name="companySize" defaultValue={company?.companySize || ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ccountry">Country</Label>
                <Input id="ccountry" name="country" defaultValue={company?.country || ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cemail">Support email</Label>
                <Input id="cemail" name="supportEmail" type="email" defaultValue={company?.supportEmail || ''} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cdesc">Description</Label>
              <Textarea id="cdesc" name="description" rows={4} defaultValue={company?.description || ''} />
            </div>
            <Button type="submit" size="sm" disabled={updateCompany.isPending}>
              {updateCompany.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save company
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="workspace" className="mt-5">
          <form onSubmit={handleWorkspaceSave} className="surface-panel max-w-2xl space-y-4 p-5">
            <div className="grid gap-2">
              <Label htmlFor="wname">Workspace name</Label>
              <Input id="wname" name="name" defaultValue={defaultWorkspace?.name || ''} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wdesc">Description</Label>
              <Textarea id="wdesc" name="description" rows={3} defaultValue={defaultWorkspace?.description || ''} />
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Your company knowledge is isolated to this workspace.
            </p>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={updateWorkspace.isPending}>
                {updateWorkspace.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save workspace
              </Button>
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                className="text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this workspace?")) {
                    if (defaultWorkspace) deleteWorkspace.mutate(defaultWorkspace.id);
                  }
                }}
              >
                Delete workspace
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="security" className="mt-5">
          <div className="surface-panel max-w-2xl space-y-4 p-5">
            <p className="text-sm text-muted-foreground">
              Passwords, multi-factor authentication and account recovery are managed by your identity
              provider.
            </p>
            <Button size="sm" variant="outline">
              Manage authentication
            </Button>
            <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
              Public customer conversations never expose internal sources, citations or retrieval
              metadata.
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <div className="surface-panel max-w-2xl divide-y divide-border p-5">
            {[
              ["Source processing failures", "Email me when a source fails to process."],
              ["Usage warnings", "Email me at 80% of any plan limit."],
              ["Weekly summary", "A weekly digest of conversations and knowledge usage."],
            ].map(([t, d], i) => (
              <div key={t} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{t}</p>
                  <p className="text-xs text-muted-foreground">{d}</p>
                </div>
                <Switch defaultChecked={i < 2} aria-label={t} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="developer" className="mt-5">
          <div className="surface-panel max-w-2xl space-y-4 p-5">
            <div className="grid gap-2">
              <Label htmlFor="pk">Public widget key</Label>
              {isAgentsLoading ? (
                <div className="flex h-10 items-center">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : firstAgent ? (
                <Input id="pk" readOnly value={firstAgent.publicKey} className="font-mono text-xs" />
              ) : (
                <p className="text-sm text-muted-foreground">Create a support agent to generate a public key.</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              The public key is safe to expose in your website snippet — it only works from approved
              origins.
            </p>
            {firstAgent && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/app/agents/${firstAgent.id}`}>
                  Manage allowed origins
                </Link>
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
