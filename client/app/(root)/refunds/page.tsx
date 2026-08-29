import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata = {
  title: "Cancellation & Refund Policy | Brainbase AI",
};

export default function RefundsPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold mb-6">Cancellation & Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Subscriptions and Billing</h2>
            <p>
              Brainbase AI is a digital software-as-a-service (SaaS). We offer a Free tier alongside paid monthly subscriptions (Pro at $12/month and Business at $39/month). Paid plans are billed on a recurring monthly basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Cancelling Your Subscription</h2>
            <p>
              You may cancel your subscription at any time from your billing dashboard. 
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>When you cancel, your subscription will not renew for the following billing cycle.</li>
              <li>You will retain access to your paid features and limits until the end of your current billing period.</li>
              <li>Once the billing period ends, your account will be downgraded to the Free plan, and usage limits will be strictly enforced.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Refund Policy</h2>
            <p>
              Because Brainbase AI offers a fully functional Free plan to test the software, and due to the immediate digital nature of the service and AI generation costs, <strong>we do not offer refunds after 7 days of the initial subscription charge.</strong>
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>If you request a refund within 7 days of your first subscription payment, we will process a full refund.</li>
              <li>We do not offer prorated refunds for mid-cycle cancellations.</li>
              <li>Exceptions may be made at our sole discretion in cases of accidental duplicate charges or prolonged service outages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Requesting a Refund</h2>
            <p>
              To request a refund within the eligible 7-day window, please contact our support team from the email address associated with your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
            <p>
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
