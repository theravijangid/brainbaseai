import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata = {
  title: "Acceptable Use Policy | Brainbase AI",
};

export default function AcceptableUsePage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold mb-6">Acceptable Use Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm leading-relaxed text-foreground">
          <p>
            This Acceptable Use Policy outlines the permitted and prohibited uses of Brainbase AI. By using our service, you agree to comply with this policy.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Prohibited Activities</h2>
            <p>You may not use Brainbase AI to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Violate any applicable laws, regulations, or third-party rights (including copyright and privacy rights).</li>
              <li>Upload, store, or process malicious code, malware, or illegal content.</li>
              <li>Attempt to reverse engineer, decompile, or hack the Brainbase AI platform.</li>
              <li>Bypass, exploit, or attempt to circumvent our rate limits, billing systems, or workspace isolation boundaries.</li>
              <li>Use the service to generate spam, harass others, or conduct fraudulent activities.</li>
              <li>Inject malicious prompts (Prompt Injection) to manipulate our infrastructure or other users' agents.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. API and Widget Abuse</h2>
            <p>
              When utilizing our API or React widgets, you must secure your API keys and only deploy widgets to domains you own or have permission to operate on. You may not build automated scraping bots against our public widget endpoints.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Enforcement</h2>
            <p>
              Brainbase AI reserves the right to investigate any violations of this policy. We may suspend or terminate your account, remove your workspaces, and report illegal activities to law enforcement without notice if we determine a violation has occurred.
            </p>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
