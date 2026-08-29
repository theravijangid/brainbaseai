"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Product", to: "/", hash: "product" },
  { label: "How it works", to: "/", hash: "how-it-works" },
  { label: "Solutions", to: "/", hash: "solutions" },
  { label: "Pricing", to: "/pricing" },
  { label: "Integrations", to: "/integrations" },
  { label: "Resources", to: "/", hash: "faq" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const className = "text-sm text-muted-foreground transition-colors hover:text-foreground";
  return (
    <>
      {nav.map((item) =>
        "hash" in item ? (
          <Link key={item.label} href={item.to}  onClick={onNavigate} className={className}>
            {item.label}
          </Link>
        ) : (
          <Link key={item.label} href={item.to} onClick={onNavigate} className={className}>
            {item.label}
          </Link>
        ),
      )}
    </>
  );
}


export function MarketingShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all",
          scrolled
            ? "border-b border-border bg-background/85 backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="BrainbaseAI home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            <NavLinks />
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {isLoaded && !isSignedIn && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
            {isLoaded && isSignedIn && (
              <Button asChild size="sm">
                <Link href="/app">Go to Dashboard</Link>
              </Button>
            )}
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-5 px-4">
                <NavLinks onNavigate={() => setOpen(false)} />
                <div className="mt-4 flex flex-col gap-2">
                  {isLoaded && !isSignedIn && (
                    <>
                      <Button asChild variant="outline">
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/sign-up">Get Started</Link>
                      </Button>
                    </>
                  )}
                  {isLoaded && isSignedIn && (
                    <Button asChild>
                      <Link href="/app">Go to Dashboard</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

type FooterLink = { label: string; href: string };

const footerCols: { title: string; links: FooterLink[] }[] = [
  { 
    title: "Product", 
    links: [
      { label: "Company Brain", href: "/#product" }, 
      { label: "Support Agents", href: "/#product" }, 
      { label: "Pricing", href: "/pricing" }
    ] 
  },
  { 
    title: "Company & Trust", 
    links: [
      { label: "Security", href: "/security" }, 
      { label: "Contact Us", href: "/contact" }
    ] 
  },
  { 
    title: "Legal", 
    links: [
      { label: "Terms of Service", href: "/terms" }, 
      { label: "Privacy Policy", href: "/privacy" }, 
      { label: "Cancellation & Refunds", href: "/refunds" }, 
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Shipping & Delivery", href: "/shipping" }
    ] 
  },
];

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-56 text-sm text-muted-foreground">
            Turn your company knowledge into an AI support agent.
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} BrainbaseAI. All rights reserved.</span>
          <span>Pricing in USD · Billing by Razorpay</span>
        </div>
      </div>
    </footer>
  );
}
