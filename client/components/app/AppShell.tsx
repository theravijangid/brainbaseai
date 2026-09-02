"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Blocks,
  Bot,
  BrainCircuit,
  ChevronsUpDown,
  Code2,
  CreditCard,
  FileStack,
  HelpCircle,
  LayoutDashboard,
  MessagesSquare,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCompany, useUsage } from "@/hooks/use-company";
import { useWorkspaces } from "@/hooks/use-workspaces";

import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const primaryNav = [
  { label: "Overview", to: "/app", icon: LayoutDashboard, exact: true },
  { label: "Company Brain", to: "/app/brain", icon: BrainCircuit },
  { label: "Sources", to: "/app/sources", icon: FileStack },
  { label: "Support Agents", to: "/app/agents", icon: Bot },
  { label: "Conversations", to: "/app/conversations", icon: MessagesSquare },
  { label: "Analytics", to: "/app/analytics", icon: BarChart3 },
  { label: "Integrations", to: "/app/integrations", icon: Blocks },
] as const;

const secondaryNav = [
  { label: "Developer Docs", to: "/app/developer", icon: Code2 },
  { label: "Settings", to: "/app/settings", icon: Settings },
  { label: "Billing", to: "/app/billing", icon: CreditCard },
] as const;

function SidebarContent({ 
  onNavigate, 
  company, 
  workspaces 
}: { 
  onNavigate?: () => void;
  company: any;
  workspaces: any[];
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const primaryEmail = user?.primaryEmailAddress?.emailAddress || '';
  const emailPrefix = primaryEmail.split('@')[0];
  const hasName = user?.firstName || user?.lastName;
  const displayName = hasName
    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    : emailPrefix || 'User';

  const initial = displayName.slice(0, 2).toUpperCase();

  const defaultWorkspace = workspaces?.[0] || { name: "Default Workspace" };
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="px-4 py-4">
        <Link href="/app" onClick={onNavigate} aria-label="BrainbaseAI dashboard">
          <Logo />
        </Link>
      </div>

      <div className="space-y-1.5 px-3 pb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-elevated px-2.5 py-2 text-left transition-colors hover:bg-sidebar-accent">
              <span className="flex size-6 items-center justify-center rounded bg-primary-soft text-[11px] font-bold text-primary">
                {company.name.substring(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{company.name}</span>
                <span className="block text-[11px] text-muted-foreground">Company</span>
              </span>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Companies</DropdownMenuLabel>
            <DropdownMenuItem>{company.name}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Add company (coming soon)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-sidebar-accent">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-[13px] text-sidebar-foreground">
                {defaultWorkspace.name}
              </span>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {workspaces?.map((ws) => (
              <DropdownMenuItem key={ws.id}>{ws.name}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>New workspace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Workspace">
        {primaryNav.map((item) => {
          const isActive = "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              href={item.to}
              onClick={onNavigate}
              data-status={isActive ? "active" : undefined}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
        <div className="my-3 border-t border-sidebar-border" />
        {secondaryNav.map((item) => {
          const isActive = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              href={item.to}
              onClick={onNavigate}
              data-status={isActive ? "active" : undefined}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
        <span className="flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground hover:bg-sidebar-accent">
          <HelpCircle className="size-4" aria-hidden /> Help
        </span>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent">
              <Avatar className="size-7">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="text-[11px]">{initial}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{displayName}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {primaryEmail}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/app/settings">Account settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/billing">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: company, isLoading: isLoadingCompany } = useCompany();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const { data: usageData } = useUsage();

  const rawPlanName = usageData?.plan?.name || "Free";
  const planName = rawPlanName.charAt(0).toUpperCase() + rawPlanName.slice(1).toLowerCase();
  const isPaid = planName.toLowerCase() !== "free";

  useEffect(() => {
    if (!isLoadingCompany && !company) {
      router.push("/onboarding/company");
    }
  }, [isLoadingCompany, company, router]);

  const crumb =
    primaryNav.find((n) => (n.to === "/app" ? pathname === "/app" : pathname.startsWith(n.to)))?.label ??
    secondaryNav.find((n) => pathname.startsWith(n.to))?.label ??
    "Overview";

  if (isLoadingCompany || isLoadingWorkspaces || !company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const defaultWorkspace = workspaces?.[0] || { name: "Default Workspace" };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border lg:block">
        <SidebarContent company={company} workspaces={workspaces || []} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent onNavigate={() => setOpen(false)} company={company} workspaces={workspaces || []} />
            </SheetContent>
          </Sheet>

          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <span className="hidden text-muted-foreground sm:inline">{company.name}</span>
            <span className="hidden text-muted-foreground sm:inline">/</span>
            <span className="text-muted-foreground">{defaultWorkspace.name}</span>
            <span className="text-muted-foreground">/</span>
            <span className="truncate font-medium">{crumb}</span>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* <button className="hidden items-center gap-2 rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border-strong sm:flex">
              <Search className="size-3.5" /> Search
              <kbd className="rounded border border-border px-1 font-mono text-[10px]">⌘K</kbd>
            </button> */}
            <Button asChild size="sm" variant={isPaid ? "secondary" : "outline"} className={cn("capitalize", isPaid && "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15")}>
              <Link href="/app/billing">{planName} plan</Link>
            </Button>
          </div>
        </header>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8", className)}>{children}</div>;
}
