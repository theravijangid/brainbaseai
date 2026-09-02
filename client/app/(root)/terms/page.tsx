import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata = {
  title: "Terms of Service | Brainbase AI",
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p>
              Welcome to Brainbase AI. These Terms of Service ("Terms") govern your use of the Brainbase AI software-as-a-service platform, including the Company Brain, Support Agents, developer APIs, and React widgets (collectively, the "Service").
            </p>
            <p className="mt-2">
              By registering for an account or using the Service, you agree to these Terms. If you are using the Service on behalf of an organization, you agree to these Terms on behalf of that organization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Account Registration and Security</h2>
            <p>
              You must register for an account to use the Service. You are responsible for safeguarding your account credentials, API keys, and workspace access. Brainbase AI utilizes third-party authentication providers (e.g., Clerk) to secure your account. You agree not to share your API keys or credentials publicly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Use of the Service and AI Responses</h2>
            <p>
              Brainbase AI provides tools to index your uploaded documents (PDF, TXT, SRT, Websites) and query them via our Company Brain and Support Agents.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>AI Limitations:</strong> Brainbase AI provides AI-generated responses based on your uploaded knowledge. However, AI responses may contain errors or inaccuracies. You are responsible for reviewing AI-generated information where appropriate.</li>
              <li><strong>Support Agents:</strong> When deploying Support Agents, you control the fallback behavior. We do not guarantee 100% accuracy in automated customer responses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Content Ownership</h2>
            <p>
              You retain full ownership of all data, documents, and website content you upload to your workspaces ("Customer Data"). You grant Brainbase AI a limited license to process, store, and utilize this data solely for the purpose of providing the Service to you (e.g., generating embeddings via Qdrant and passing context to third-party LLMs like OpenAI/OpenRouter).
            </p>
            <p className="mt-2">
              <strong>We do not use your Customer Data to train our own base models, and we do not permit our third-party LLM providers to use your data for training.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Subscriptions, Payments, and Limits</h2>
            <p>
              We offer Free, Pro ($12/month), and Business ($39/month) plans. Payments are processed securely via our payment provider, Razorpay.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Limits:</strong> Usage is strictly bounded by your plan's limits (workspaces, sources, active agents, and conversations). If limits are reached, the Service will prevent further actions until upgraded.</li>
              <li><strong>Taxes:</strong> All fees are exclusive of applicable taxes unless stated otherwise.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
            <p>
              You may cancel your subscription at any time. Brainbase AI reserves the right to suspend or terminate your account if you violate these Terms or our Acceptable Use Policy, including attempts to bypass rate limits or abuse the API.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Disclaimers and Limitation of Liability</h2>
            <p>
              The Service is provided "AS IS" without warranties of any kind. To the maximum extent permitted by law, Brainbase AI shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Service, including data loss or business interruption.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Goa, India. Brainbase AI is available to users globally, and you agree to submit to the jurisdiction of the courts located in Goa, India for any disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p>
              Brainbase AI<br />
              {/* Pilerne, Saligao<br />
              Goa 403511, India<br /> */}
              Email: support@brainbaseai.com
            </p>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
