import { apiConnector } from '../lib/api-client';

export interface PlanLimit {
  workspaces: string;
  sources: string;
  agents: string;
  knowledgeChat: string;
  supportConversations: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  highlighted: boolean;
  limits: PlanLimit;
}

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  currency: string;
}

export const getPlans = async (token: string | null): Promise<Plan[]> => {
  return apiConnector.get<Plan[]>('/billing/plans', token);
};

export const getSubscription = async (token: string | null): Promise<Subscription | null> => {
  return apiConnector.get<Subscription | null>('/billing/subscription', token);
};

export const createCheckoutSession = async (token: string | null, planId: string): Promise<{ orderId: string; amount: number; currency: string; key: string }> => {
  return apiConnector.post<{ orderId: string; amount: number; currency: string; key: string }>('/billing/checkout', { planId }, token);
};

export const verifyPayment = async (
  token: string | null,
  paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; planId: string }
): Promise<Subscription> => {
  return apiConnector.post<Subscription>('/billing/verify-payment', paymentData, token);
};
