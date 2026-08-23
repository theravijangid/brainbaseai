"use client";

import { CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import Script from "next/script";
import { format } from "date-fns";

import { Page, PageHeader } from "@/components/app/AppShell";
import { UsageMeter } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";

import { useUsage } from "@/hooks/use-company";
import { usePlans, useSubscription, useCheckoutSession, useVerifyPayment } from "@/hooks/use-billing";

export default function RoutePage(props: any) {
  return <BillingPage {...props} />;
}

function BillingPage() {
  const { data: usageData, isLoading: isUsageLoading } = useUsage();
  const { data: plans = [], isLoading: isPlansLoading } = usePlans();
  const { data: subscription, isLoading: isSubscriptionLoading } = useSubscription();
  
  const checkout = useCheckoutSession();
  const verify = useVerifyPayment();

  const handleUpgrade = async (planId: string) => {
    try {
      const { orderId, amount, currency, key } = await checkout.mutateAsync(planId);
      
      const options = {
        key: key, 
        amount: amount, 
        currency: currency,
        name: "BrainbaseAI",
        description: "Plan Upgrade",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await verify.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: planId
            });
            alert('Subscription upgraded successfully!');
          } catch (e) {
            console.error('Payment verification failed', e);
            alert('Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: "#0f172a",
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        console.error(response.error);
        alert(response.error.description);
      });
      rzp.open();
      
    } catch (error) {
      console.error('Failed to create checkout session', error);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  const isLoading = isUsageLoading || isPlansLoading || isSubscriptionLoading;

  if (isLoading) {
    return (
      <Page>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </Page>
    );
  }

  const usage = usageData?.usage;
  const planName = usageData?.plan?.name || "Free";
  const isSubscribed = subscription && subscription.status === 'active';
  const proPlan = plans.find((p) => p.name.toLowerCase() === "pro");

  return (
    <Page>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <PageHeader title="Billing" description="Your company billing and usage" />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-panel p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</p>
              <p className="mt-1 font-display text-2xl font-semibold">{planName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSubscribed ? "Subscription active" : "No subscription active · upgrade any time"}
              </p>
            </div>
            {!isSubscribed && proPlan && (
              <Button onClick={() => handleUpgrade(proPlan.id)} disabled={checkout.isPending}>
                {checkout.isPending ? "Loading..." : "Upgrade to Pro"}
              </Button>
            )}
          </div>

          <div className="mt-6 space-y-5 border-t border-border pt-5">
            <h2 className="text-sm font-semibold">Usage this month</h2>
            <UsageMeter label="Workspaces" used={usage?.workspaces?.used || 0} limit={usage?.workspaces?.limit} />
            <UsageMeter label="Sources" used={usage?.sources?.used || 0} limit={usage?.sources?.limit} />
            <UsageMeter label="Active agents" used={usage?.agents?.used || 0} limit={usage?.agents?.limit} />
            <UsageMeter label="Knowledge Chat" used={usage?.knowledgeChat?.used || 0} limit={usage?.knowledgeChat?.limit} unit="msgs" />
            <UsageMeter
              label="Support conversations"
              used={usage?.supportConversations?.used || 0}
              limit={usage?.supportConversations?.limit}
            />
          </div>
        </div>

        <div className="surface-panel p-5">
          <h2 className="text-sm font-semibold">Subscription</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{isSubscribed ? subscription.status : 'No active subscription'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Next billing date</dt>
              <dd>{isSubscribed ? format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy') : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{isSubscribed ? subscription.currency : 'USD'}</dd>
            </div>
          </dl>
          <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Payments are processed securely by our billing provider. We never store card details.
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-sm font-semibold">Available plans</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrentPlan = p.name === planName;
          return (
            <div
              key={p.id}
              className={
                p.highlighted ? "rounded-xl border-2 border-primary bg-elevated p-5" : "surface-panel p-5"
              }
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide">{p.name}</h3>
              <p className="mt-2 font-display text-3xl font-semibold">
                ${p.price}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {Object.values(p.limits).map((l) => (
                  <li key={l as string} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                    <span className="text-muted-foreground">{l as string}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={isCurrentPlan ? "outline" : p.highlighted ? "default" : "outline"}
                disabled={isCurrentPlan || checkout.isPending}
                onClick={() => handleUpgrade(p.id)}
              >
                {isCurrentPlan ? "Current plan" : `Upgrade to ${p.name}`}
              </Button>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
