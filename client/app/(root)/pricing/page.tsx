import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs, plans } from "@/lib/brainbase-data";

export const metadata = {
  title: "Pricing — BrainbaseAI",
};

export default function RoutePage(props: any) {
  return <PricingPage {...props} />;
}


const rows = [
  ["Workspaces", "2", "5", "Unlimited"],
  ["Sources per workspace", "5", "50", "200"],
  ["Active Support Agents", "1", "5", "15"],
  ["Knowledge Chat messages / month", "100", "1,000", "5,000"],
  ["Support Agent conversations / month", "100", "2,000", "10,000"],
  ["Citations in Company Brain", "Yes", "Yes", "Yes"],
  ["Website embed", "Yes", "Yes", "Yes"],
];

function PricingPage() {
  return (
    <MarketingShell>
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-semibold text-balance-tight sm:text-5xl">
            Pricing that grows with your knowledge
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Monthly billing in USD. Start free, upgrade when your agents get busy.
          </p>

          <div className="mt-12 grid gap-5 text-left lg:grid-cols-3">
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
                <h2 className="text-sm font-semibold uppercase tracking-wide">{p.name}</h2>
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
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold">Compare plans</h2>
          <div className="surface-panel mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Plan comparison</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                    Feature
                  </th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className="px-4 py-3 font-semibold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0]} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal text-muted-foreground">
                      {r[0]}
                    </th>
                    {r.slice(1).map((c, i) => (
                      <td key={i} className="px-4 py-3">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Billing is handled securely by our payment provider. Additional billing periods are coming.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold">Billing questions</h2>
          <Accordion type="single" collapsible className="mt-6">
            {faqs.slice(-3).map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </MarketingShell>
  );
}
