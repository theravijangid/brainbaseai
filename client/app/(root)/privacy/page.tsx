import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata = {
  title: "Privacy Policy | Brainbase AI",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p>
              At Brainbase AI, we take your privacy seriously. This Privacy Policy explains what information we collect, how we use it, and your rights when you use our web application, Company Brain, and Support Agents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> We collect your name, email address, and profile details via our authentication provider (Clerk) when you sign up.</li>
              <li><strong>Customer Data (Workspaces & Sources):</strong> We store the documents, text, and website URLs you actively upload to create your knowledge bases.</li>
              <li><strong>Conversation History:</strong> We store chat queries and AI responses generated within your Company Brain and public Support Agents to provide analytics and context.</li>
              <li><strong>Technical Data:</strong> We collect API usage, request logs, and widget initialization data to enforce rate limits and ensure service stability.</li>
              <li><strong>Payment Information:</strong> Handled entirely by our secure payment provider (Razorpay). Brainbase AI does not directly store your credit card numbers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p>We use the collected data specifically to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide, maintain, and secure the Brainbase AI service.</li>
              <li>Process your documents into vector embeddings (via Qdrant) to enable search.</li>
              <li>Generate AI responses via third-party LLMs to answer your queries.</li>
              <li>Provide usage analytics within your dashboard.</li>
              <li>Bill you for your subscription (Pro/Business).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Processors and AI Data Handling</h2>
            <p>
              To operate the service, we share necessary data with trusted third-party providers. 
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>AI Models (OpenAI, OpenRouter):</strong> We send retrieved context and user queries to these providers to generate responses. <strong>We do not permit these providers to use your data to train their models.</strong></li>
              <li><strong>Infrastructure:</strong> We use AWS (S3) for raw document storage, Neon for our PostgreSQL database, and Qdrant for vector embeddings.</li>
              <li><strong>Authentication:</strong> Clerk securely manages your login credentials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Retention and Deletion</h2>
            <p>
              We retain your data as long as your account is active. If you delete a workspace, document source, or your entire account, we cascade the deletion to our databases and vector storage. We do not retain orphaned customer knowledge.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
            <p>
              For privacy-related requests or questions about this policy, please contact us at:
              <br /><br />
              Brainbase AI<br />
              Pilerne, Saligao<br />
              Goa 403511, India<br />
              Email: support@brainbaseai.com
            </p>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
