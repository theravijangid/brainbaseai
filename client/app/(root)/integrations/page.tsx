import Link from "next/link";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { integrations } from "@/lib/brainbase-data";

export const metadata = {
  title: "Integrations — BrainbaseAI",
};

export default function RoutePage(props: any) {
  return <IntegrationsPage {...props} />;
}


const categories = ["Website", "Knowledge", "Communication", "Customer Support", "Automation"] as const;

function IntegrationsPage() {
  return (
    <MarketingShell>
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="max-w-2xl text-4xl font-semibold text-balance-tight sm:text-5xl">
            Connect BrainbaseAI to the tools your knowledge already lives in
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Website embed is available today. Anything marked Coming Soon is not live yet.
          </p>
          <Button asChild className="mt-7">
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6">
          {categories.map((cat) => {
            const items = integrations.filter((i) => i.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <h2 className="text-lg font-semibold">{cat}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((i) => (
                    <div key={i.name} className="surface-panel flex flex-col p-5">
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
                        className="mt-4"
                        size="sm"
                        variant={i.available ? "default" : "outline"}
                        disabled={!i.available}
                      >
                        {i.available ? "Connect" : "Coming Soon"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </MarketingShell>
  );
}
