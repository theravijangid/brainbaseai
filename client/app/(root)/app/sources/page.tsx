"use client";

import {
  FileStack,
  FileText,
  Globe,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Upload,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { Page, PageHeader } from "@/components/app/AppShell";
import { EmptyState, StatusPill } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { useWorkspaces } from "@/hooks/use-workspaces";
import { useAuth } from "@clerk/nextjs";
import { sourcesApi } from "@/api/sources.api";
import { toast } from "sonner";
import {
  useSources,
  useUploadSource,
  useRegisterUrlSource,
  useDeleteSource,
  useRetrySource,
  useSyncSource
} from "@/hooks/use-sources";

const filters = ["All", "Files", "Websites", "Processing", "Ready", "Failed"] as const;

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getSourceDetail(s: any): string {
  if (s.type === 'website') {
    return s.originalUrl || s.metadata?.url || s.name;
  }
  let sizeStr = '';
  if (s.metadata?.size) {
    sizeStr = formatBytes(s.metadata.size) + ' · ';
  }
  if (s.metadata?.pages) return `${sizeStr}${s.metadata.pages} pages`;
  if (s.metadata?.duration) return `${sizeStr}${s.metadata.duration}`;
  return sizeStr.replace(' · ', '') || s.name;
}

function statusPill(s: any) {
  if (s.status === "READY") return <StatusPill tone="success">Ready</StatusPill>;
  if (s.status === "QUEUED" || s.status === "PARSING" || s.status === "CHUNKING" || s.status === "EMBEDDING" || s.status === "UPLOADING") return <StatusPill tone="warning">Processing</StatusPill>;
  return <StatusPill tone="danger">Failed</StatusPill>;
}

function AddSourceDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  
  const uploadSource = useUploadSource(workspaceId);
  const registerUrl = useRegisterUrlSource(workspaceId);

  const isPending = uploadSource.isPending || registerUrl.isPending;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadSource.mutate(file, {
      onSuccess: () => setOpen(false)
    });
    e.target.value = "";
  };

  const handleUrlSubmit = () => {
    if (!url) return;
    registerUrl.mutate({ url, type: "website" }, {
      onSuccess: () => {
        setUrl("");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Add Source
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a knowledge source</DialogTitle>
          <DialogDescription>
            Upload a PDF, TXT or SRT file, or add a website URL. Supported files up to 25 MB.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
             <Loader2 className="size-8 animate-spin text-primary" />
             <p className="text-sm font-medium text-muted-foreground">Uploading source...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-border-strong">
              <Upload className="size-5 text-muted-foreground" aria-hidden />
              <span className="text-sm font-medium">Drop a file or browse</span>
              <span className="text-xs text-muted-foreground">PDF · TXT · SRT</span>
              <input type="file" className="sr-only" onChange={handleFileUpload} accept=".pdf,.txt,.srt,.md" disabled={isPending} />
            </label>
            <div className="grid gap-2">
              <Label htmlFor="url">Or add a website URL</Label>
              <Input 
                id="url" 
                placeholder="https://acme.com/help" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleUrlSubmit}
            disabled={!url || isPending}
          >
            Add website
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RowActions({ source, workspaceId }: { source: any; workspaceId: string }) {
  const deleteSource = useDeleteSource(workspaceId);
  const syncSource = useSyncSource(workspaceId);
  const { getToken } = useAuth();
  const [opening, setOpening] = useState(false);

  const handleOpen = async () => {
    if (source.type === "website" || source.type === "youtube") {
      const targetUrl = source.originalUrl || source.metadata?.url;
      if (targetUrl) {
        window.open(targetUrl, "_blank");
      }
      return;
    }

    try {
      setOpening(true);
      const token = await getToken();
      const blob = await sourcesApi.getSourceViewBlob(workspaceId, source.id, token);
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to open source file");
    } finally {
      setOpening(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${source.name}`}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleOpen} disabled={opening}>
          {opening ? "Opening..." : "Open"}
        </DropdownMenuItem>
        {source.type === "website" ? (
          <DropdownMenuItem onClick={() => syncSource.mutate(source.id)} disabled={syncSource.isPending}>
            {syncSource.isPending ? "Syncing..." : "Sync source"}
            <span className="ml-auto text-[11px] text-muted-foreground">fetch latest</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>Replace source</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive"
          onClick={() => deleteSource.mutate(source.id)}
          disabled={deleteSource.isPending}
        >
          {deleteSource.isPending ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function SourcesPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const defaultWorkspace = workspaces?.[0];
  const workspaceId = defaultWorkspace?.id || '';

  const { data: sources, isLoading: isSourcesLoading } = useSources(workspaceId);
  const retrySource = useRetrySource(workspaceId);

  if (isWorkspacesLoading || isSourcesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const allSources = sources || [];

  const list = allSources.filter((s: any) => {
    if (filter === "All") return true;
    if (filter === "Files") return s.type !== "website";
    if (filter === "Websites") return s.type === "website";
    if (filter === "Processing") return s.status !== "READY" && s.status !== "FAILED";
    if (filter === "Ready") return s.status === "READY";
    return s.status === "FAILED";
  });

  const failedSources = allSources.filter((s: any) => s.status === 'FAILED');

  return (
    <Page>
      <PageHeader
        title="Knowledge Sources"
        description={`${allSources.length} sources used · ${defaultWorkspace?.name || "Workspace"}`}
        actions={<AddSourceDialog workspaceId={workspaceId} />}
      />

      <div className="mt-5 flex items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as (typeof filters)[number])}>
          <TabsList>
            {filters.map((f) => (
              <TabsTrigger key={f} value={f}>
                {f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={FileStack}
            title="Your Company Brain is empty."
            description="Add a document or website and your agents will start answering from it within minutes."
            action={<AddSourceDialog workspaceId={workspaceId} />}
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="surface-panel mt-5 hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <caption className="sr-only">Knowledge sources</caption>
              <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Source</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Type</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Last updated</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Details</th>
                  <th scope="col" className="px-4 py-2.5 font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s: any) => (
                  <tr key={s.id} className="border-t border-border">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      <span className="flex items-center gap-2">
                        {s.type === "website" ? (
                          <Globe className="size-4 text-muted-foreground" />
                        ) : (
                          <FileText className="size-4 text-muted-foreground" />
                        )}
                        {s.name}
                      </span>
                    </th>
                    <td className="px-4 py-3 uppercase text-muted-foreground">{s.type}</td>
                    <td className="px-4 py-3">{statusPill(s)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.updatedAt ? formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true }) : 'Just now'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{getSourceDetail(s)}</td>
                    <td className="px-4 py-3 text-right">
                      <RowActions source={s} workspaceId={workspaceId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-5 space-y-3 md:hidden">
            {list.map((s: any) => (
              <div key={s.id} className="surface-panel p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    {s.type === "website" ? (
                      <Globe className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-sm font-medium">{s.name}</span>
                  </span>
                  <RowActions source={s} workspaceId={workspaceId} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {statusPill(s)}
                  <span className="text-xs text-muted-foreground">
                    {s.updatedAt ? formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {failedSources.length > 0 ? (
        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Something went wrong while processing {failedSources.length} source(s).
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your last known-good version is still answering questions, so your agents are unaffected.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => retrySource.mutate(failedSources[0].id)} disabled={retrySource.isPending}>
              <RefreshCw className={cn("size-3.5", retrySource.isPending && "animate-spin")} /> Retry {failedSources[0].name}
            </Button>
          </div>
        </div>
      ) : null}
    </Page>
  );
}
