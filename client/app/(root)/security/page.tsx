import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata = {
  title: "Security | Brainbase AI",
};

export default function SecurityPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold mb-6">Security at Brainbase AI</h1>
        <p className="text-sm text-muted-foreground mb-8">How we protect your data and infrastructure.</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Workspace Isolation</h2>
            <p>
              We enforce strict multi-tenant data isolation. Your sources, agents, and conversations are cryptographically tied to your specific Workspace ID. Our backend API actively validates that the authenticated user holds permissions for the requested workspace before executing database queries or vector searches.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Authentication and Identity</h2>
            <p>
              Brainbase AI utilizes Clerk for robust, industry-standard authentication. We do not store your passwords in our database. Session tokens and JWTs are used to securely authorize requests between the web application and our backend API.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. API and Widget Security</h2>
            <p>
              When deploying a public Support Agent to your website, Brainbase AI secures it using two layers:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Agent-Specific API Keys:</strong> Each Support Agent receives a unique, cryptographically generated UUID (Public Key) that restricts access strictly to that agent's approved knowledge scope.</li>
              {/* <li><strong>Domain Allowlisting:</strong> Our widget endpoints enforce Cross-Origin Resource Sharing (CORS) and origin validation. Your agent will only load and respond on the website domains you explicitly approve in the dashboard.</li> */}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Rate Limiting</h2>
            <p>
              Our infrastructure employs strict IP-based rate limiting to prevent abuse, scraping, and denial-of-service (DoS) attacks on your public Support Agents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Storage and LLMs</h2>
            <p>
              Your uploaded documents are stored securely in AWS S3, and vector embeddings are stored in Qdrant. When you query an agent, we retrieve the relevant context and pass it securely to our third-party LLM providers (e.g., OpenAI). <strong>We have opted out of data sharing for model training with these providers.</strong> Your private knowledge is not used to train global AI models.
            </p>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
