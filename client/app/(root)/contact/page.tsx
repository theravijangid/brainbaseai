import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Contact Us | Brainbase AI",
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-semibold mb-6">Contact Us</h1>
        <p className="text-sm text-muted-foreground mb-12">
          Have a question about Brainbase AI? Whether you need technical support, have a billing inquiry, or want to discuss enterprise options, we're here to help.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="surface-panel p-6 rounded-xl border border-border">
            <h3 className="font-semibold text-lg mb-2">Technical Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Need help setting up your workspace, configuring an agent, or using the API?
            </p>
            <Button variant="outline" asChild className="w-full">
              <a href="mailto:support@brainbaseai.com?subject=Technical Support">Email Support</a>
            </Button>
          </div>

          <div className="surface-panel p-6 rounded-xl border border-border">
            <h3 className="font-semibold text-lg mb-2">Billing & Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Questions about your Pro or Business plan, invoices, or refunds?
            </p>
            <Button variant="outline" asChild className="w-full">
              <a href="mailto:support@brainbaseai.com?subject=Billing Inquiry">Email Billing</a>
            </Button>
          </div>
        </div>

        <div className="mt-16 space-y-4 text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Company Address</h2>
          <p>
            Brainbase AI<br />
            Pilerne, Saligao<br />
            Goa 403511<br />
            India
          </p>
          <p className="pt-4">
            We aim to respond to all inquiries within 24-48 business hours.
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}
