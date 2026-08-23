import Link from "next/link";
import { Code2, ShieldCheck } from "lucide-react";

import { Page, PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { integrations } from "@/lib/brainbase-data";

export const metadata = {
  title: "Integrations — BrainbaseAI",
  description: "Connect BrainbaseAI to your website and other tools.",
};

export default function RoutePage(props: any) {
  return <AppIntegrationsPage {...props} />;
}


const categories = ["Website", "Knowledge", "Communication", "Customer Support", "Automation"] as const;

function AppIntegrationsPage() {
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
                      className="mt-4"
                      variant={i.available ? "default" : "outline"}
                      disabled={!i.available}
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
    </Page>
  );
}
