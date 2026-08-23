import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getPlans, getSubscription, createCheckoutSession, verifyPayment } from '../api/billing.api';
import { toast } from 'sonner';

export const usePlans = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const token = await getToken();
      return getPlans(token);
    },
    enabled: isLoaded && isSignedIn,
  });
};

export const useSubscription = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: async () => {
      const token = await getToken();
      return getSubscription(token);
    },
    enabled: isLoaded && isSignedIn,
  });
};

export const useCheckoutSession = () => {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (planId: string) => {
      const token = await getToken();
      return createCheckoutSession(token, planId);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to initiate checkout');
    },
  });
};

export const useVerifyPayment = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; planId: string }) => {
      const token = await getToken();
      return verifyPayment(token, paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'usage'] });
      toast.success('Subscription activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Payment verification failed');
    },
  });
};

