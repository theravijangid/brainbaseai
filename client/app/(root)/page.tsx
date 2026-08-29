import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  FileText,
  Globe,
  Lock,
  MessagesSquare,
  Quote,
  RefreshCw,
  Shield,
  Upload,
  Zap,
} from "lucide-react";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SupportWidgetPanel } from "@/components/widget/SupportWidget";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs, integrations, plans } from "@/lib/brainbase-data";

export const metadata = {
  title: "BrainbaseAI — Turn company knowledge into an AI support agent",
};

export default function RoutePage(props: any) {
  return <LandingPage {...props} />;
}


function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  body,
  center = true,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-semibold text-balance-tight sm:text-4xl">{title}</h2>
      {body ? <p className="mt-3 text-base leading-relaxed text-muted-foreground">{body}</p> : null}
    </div>
  );
}

function FlowChip({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <div
      className={
        muted
          ? "rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground"
          : "rounded-lg border border-primary/25 bg-primary-soft px-3 py-2 text-xs font-medium text-primary"
      }
    >
      {label}
    </div>
  );
}

function LandingPage() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 hero-grid" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>
              <span className="size-1.5 rounded-full bg-success" /> Company Brain + Support Agent
            </Eyebrow>
            <h1 className="mt-5 text-4xl font-semibold text-balance-tight sm:text-5xl lg:text-6xl">
              Turn your company knowledge into an AI support agent.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              For SaaS, e-commerce, and knowledge-heavy businesses. Connect your company's knowledge and give customers instant, accurate answers through an
              AI agent that understands your business.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Get Started Free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/" >
                  See How It Works
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free plan includes 2 workspaces and 1 active Support Agent. No card required.
            </p>
          </div>

          {/* Hero product preview */}
          <div className="mt-16 grid gap-4 lg:grid-cols-[1.35fr_1fr]" id="product">
            <div className="surface-panel overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
                <span className="size-2 rounded-full bg-border-strong" />
                <span className="size-2 rounded-full bg-border-strong" />
                <span className="size-2 rounded-full bg-border-strong" />
                <span className="ml-2 text-xs text-muted-foreground">Company Brain · Acme Support</span>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Company knowledge
                  </p>
                  {[
                    { icon: FileText, name: "Refund Policy.pdf", meta: "Ready" },
                    { icon: FileText, name: "Onboarding Handbook.pdf", meta: "Ready" },
                    { icon: Globe, name: "acme.com/help", meta: "Synced 2h ago" },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center gap-2.5 rounded-lg border border-border bg-elevated px-3 py-2.5"
                    >
                      <s.icon className="size-4 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm">{s.name}</span>
                      <span className="text-[11px] text-success">{s.meta}</span>
                    </div>
                  ))}
                  <div className="rounded-lg border border-primary/25 bg-primary-soft px-3 py-2.5 text-sm font-medium text-primary">
                    BrainbaseAI · indexed & ready
                  </div>
                </div>
                <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Internal answer
                  </p>
                  <p className="text-sm leading-relaxed">
                    Your refund policy allows customers to request a refund within 14 days of delivery.
                  </p>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-elevated px-2.5 py-2 text-xs text-muted-foreground">
                    <Quote className="size-3" /> Refund Policy.pdf · Section 3 · p.4
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Citations appear only inside Company Brain.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <SupportWidgetPanel className="h-[420px] max-w-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
          {[
            { icon: Lock, label: "Secure company knowledge" },
            { icon: Shield, label: "Workspace isolation" },
            { icon: Lock, label: "Agent access control" },
            { icon: Shield, label: "Secure API keys" },
            { icon: Zap, label: "Usage-based plans" },
          ].map((i) => (
            <div key={i.label} className="flex items-center gap-2.5">
              <i.icon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="text-sm text-muted-foreground">{i.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            eyebrow="How it works"
            title="From scattered documents to a live support agent"
            body="Four steps, no engineering project."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                icon: Upload,
                title: "Connect your knowledge",
                body: "Upload PDF, TXT and SRT files or point us at a website URL.",
                preview: ["Refund Policy.pdf", "acme.com/help", "Shipping FAQ.txt"],
              },
              {
                n: "02",
                icon: BrainCircuit,
                title: "Organize it into workspaces",
                body: "Keep product, billing and internal knowledge cleanly separated.",
                preview: ["Acme Support", "Internal Helpdesk"],
              },
              {
                n: "03",
                icon: Bot,
                title: "Create your AI Support Agent",
                body: "Set instructions, choose knowledge scope, style the widget.",
                preview: ["Instructions", "Knowledge scope", "Appearance"],
              },
              {
                n: "04",
                icon: Code2,
                title: "Embed it in your application",
                body: "Drop in the React widget or script snippet.",
                preview: ["<SupportWidget />", "acme.com approved"],
              },
            ].map((s) => (
              <div key={s.n} className="surface-panel flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft">
                    <s.icon className="size-4 text-primary" aria-hidden />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{s.body}</p>
                <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-surface p-3">
                  {s.preview.map((p) => (
                    <p key={p} className="truncate font-mono text-[11px] text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS HEADER */}
      <section id="solutions" className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            eyebrow="Solutions"
            title="One knowledge base. Two ways to use it."
            body="Empower your internal team with a private brain, or deploy a public agent to answer customer questions."
          />
        </div>
      </section>

      {/* COMPANY BRAIN */}
      <section className="border-b border-border py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHead
              center={false}
              eyebrow="Company Brain"
              title="A private brain your team can actually ask questions to"
              body="Employees ask in plain language and get answers grounded in your approved company knowledge — with citations back to the exact document, section and page."
            />
            <ul className="mt-6 space-y-3">
              {[
                "Answers cite the source document, section and page",
                "Click a citation to inspect the original source",
                "Knowledge stays isolated to its workspace",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-panel p-5">
            <div className="grid grid-cols-4 items-center gap-2 text-center">
              <FlowChip label="Sources" muted />
              <FlowChip label="Processing" muted />
              <FlowChip label="Company Brain" />
              <FlowChip label="Cited answer" muted />
            </div>
            <div className="mt-5 space-y-3 rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-medium">What is our refund window for damaged goods?</p>
              <div className="rounded-lg border border-border bg-elevated p-3">
                <p className="text-sm leading-relaxed">
                  Customers can request a refund within 14 days of delivery. Damaged goods are eligible
                  for a full refund or replacement with photo evidence.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground">
                    <Quote className="size-3" /> Refund Policy.pdf · §3 · p.4
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground">
                    <Quote className="size-3" /> acme.com/help · Returns
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT AGENT */}
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div className="order-2 flex justify-center lg:order-1">
            <SupportWidgetPanel className="h-[460px]" />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHead
              center={false}
              eyebrow="Support Agent"
              title="Your customers get answers, not a document dump"
              body="The public agent answers from your approved knowledge in a clean, conversational way. Customers never see internal metadata. An AI that knows when it doesn't have the answer — automatically falling back to a custom message directing users to human support when information isn't found."
            />
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <FlowChip label="Knowledge" muted />
              <FlowChip label="Support Agent" />
              <FlowChip label="Customer" muted />
              <FlowChip label="Instant answer" muted />
            </div>
          </div>
        </div>
      </section>

      {/* KNOWLEDGE SOURCES */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            eyebrow="Knowledge sources"
            title="Bring the knowledge you already have"
            body="Documents and website pages become searchable knowledge in minutes."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "PDF", d: "Policies, handbooks, manuals" },
              { t: "TXT", d: "Plain-text notes and FAQs" },
              { t: "SRT", d: "Video and webinar transcripts" },
              { t: "Website", d: "Help centres and public pages" },
            ].map((s) => (
              <div key={s.t} className="surface-panel p-5">
                <span className="font-mono text-xs font-semibold text-primary">{s.t}</span>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Upload", "Process", "Index", "Ready"].map((s, i) => (
              <FlowChip key={s} label={`${i + 1}. ${s}`} muted={i < 3} />
            ))}
          </div>
        </div>
      </section>

      {/* SOURCE UPDATE */}
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <SectionHead
            center={false}
            eyebrow="Always current"
            title="Your knowledge changes. Your AI should too."
            body="Replace a document with a new version or re-sync a website whenever things change. If an update can't be processed, your last working knowledge stays live — your agent never goes dark."
          />
          <div className="surface-panel p-6">
            <div className="space-y-3">
              {[
                { label: "Old knowledge", tone: "muted" },
                { label: "Sync / Update", tone: "primary" },
                { label: "New knowledge", tone: "muted" },
                { label: "AI stays up to date", tone: "success" },
              ].map((s) => (
                <div
                  key={s.label}
                  className={
                    s.tone === "primary"
                      ? "flex items-center gap-2.5 rounded-lg border border-primary/25 bg-primary-soft px-4 py-3 text-sm font-medium text-primary"
                      : s.tone === "success"
                        ? "flex items-center gap-2.5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
                        : "flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground"
                  }
                >
                  {s.tone === "primary" ? <RefreshCw className="size-4" /> : null}
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            eyebrow="Analytics"
            title="Understand how your knowledge is being used"
            body="Track internal Company Brain usage and customer conversations through your Support Agents over time."
          />
          <div className="surface-panel mt-10 overflow-hidden">
            <div className="grid gap-px border-b border-border bg-border sm:grid-cols-4">
              {[
                { l: "Conversations", v: "1,462" },
                { l: "Knowledge usage", v: "297" },
                { l: "Agent usage", v: "3 active" },
                { l: "Resolution trend", v: "+12%" },
              ].map((m) => (
                <div key={m.l} className="bg-elevated p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{m.l}</p>
                  <p className="mt-2 font-display text-xl font-semibold">{m.v}</p>
                </div>
              ))}
            </div>
            <div className="flex h-44 items-end gap-2 px-5 py-6">
              {[38, 52, 44, 61, 74, 48, 66, 82, 58, 71, 88, 64].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/80"
                  style={{ height: `${h}%` }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="flex items-center gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <BarChart3 className="size-3.5" /> Conversations over the last 7, 30, and 45 days · Usage limits
              tracked per plan
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            eyebrow="Integrations"
            title="Start with your website. More connectors on the way."
            body="Website embed is available today. Everything marked Coming Soon isn't live yet — we won't pretend otherwise."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {integrations.map((i) => (
              <div key={i.name} className="surface-panel flex flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold">{i.name}</span>
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
                <p className="mt-2 text-sm text-muted-foreground">{i.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/integrations">Browse all integrations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* DEVELOPERS */}
      <section className="border-b border-border py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHead
              center={false}
              eyebrow="Built for developers"
              title="Integrate seamlessly into your existing application"
              body="Embed Brainbase into your website with our React widget or integrate directly using the Brainbase API. Secure API keys and allowed domains keep your agent safe."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <FlowChip label="React NPM Widget" muted />
              <FlowChip label="REST API" muted />
              <FlowChip label="Secure API Keys" muted />
              {/* <FlowChip label="Domain Allowlisting" muted /> */}
            </div>
          </div>
          <div className="surface-panel p-6 overflow-hidden">
             <div className="rounded-lg border border-border bg-surface p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
               <span className="text-primary">npm</span> install @brainbase/react-widget<br/><br/>
               <span className="text-primary">import</span> {'{ SupportWidget }'} <span className="text-primary">from</span> '@brainbase/react-widget';<br/><br/>
               {'<SupportWidget'}<br/>
               &nbsp;&nbsp;apiKey=<span className="text-success">"pk_live_..."</span><br/>
               &nbsp;&nbsp;theme=<span className="text-success">"dark"</span><br/>
               {'/>'}
             </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            eyebrow="Pricing"
            title="Simple, usage-based pricing"
            body="Monthly billing in USD. Upgrade or downgrade at any time."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className={
                  p.highlighted
                    ? "relative rounded-xl border-2 border-primary bg-elevated p-6 shadow-[var(--shadow-card)]"
                    : "surface-panel p-6"
                }
              >
                {p.highlighted ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-sm font-semibold uppercase tracking-wide">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-4 font-display text-4xl font-semibold">
                  ${p.price}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <Button asChild className="mt-5 w-full" variant={p.highlighted ? "default" : "outline"}>
                  <Link href="/sign-up">{p.price === 0 ? "Get Started Free" : `Choose ${p.name}`}</Link>
                </Button>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {Object.values(p.limits).map((l) => (
                    <li key={l} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span>{l}</span>
                    </li>
                  ))}
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-border-strong" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHead eyebrow="FAQ" title="Questions, answered" />
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <MessagesSquare className="mx-auto size-6 text-primary" aria-hidden />
          <h2 className="mt-5 text-3xl font-semibold text-balance-tight sm:text-4xl">
            Build your AI support agent today.
          </h2>
          <p className="mt-3 text-muted-foreground">
            One place to manage company knowledge and deploy an AI support team.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/sign-up">
              Get Started Free <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}
