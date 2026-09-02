import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata = {
  title: "Shipping & Delivery Policy | Brainbase AI",
};

export default function ShippingPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold mb-6">Shipping & Digital Delivery Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Digital Service Only</h2>
            <p>
              Brainbase AI is a digital software-as-a-service (SaaS) platform. We do not manufacture, sell, or ship any physical goods or hardware.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Account Delivery</h2>
            <p>
              Upon successful registration of an account, you will immediately receive electronic access to the Brainbase AI dashboard and the Free plan tier. No physical shipping is required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Subscription Activation</h2>
            <p>
              When you upgrade to a paid subscription (Pro or Business), your upgraded limits (such as increased workspaces, sources, and conversation limits) are activated immediately upon successful processing of your payment by our gateway (Razorpay).
            </p>
            <p className="mt-2">
              If you experience a delay in your account reflecting the upgraded status after a successful charge, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Contact Us</h2>
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
