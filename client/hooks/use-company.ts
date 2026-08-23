import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { companyApi } from '../api/company.api';
import { toast } from 'sonner';

export function useCompany() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const token = await getToken();
      return companyApi.getCompany(token);
    },
    enabled: isLoaded && isSignedIn,
    retry: false, // Don't retry if it fails (e.g. 404/not found means not onboarded)
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      website?: string;
      industry?: string;
      companySize?: string;
      country?: string;
      description?: string;
      supportEmail?: string;
    }) => {
      const token = await getToken();
      return companyApi.updateCompany(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update company');
    },
  });
}

export function useOnboardCompany() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      website?: string;
      industry?: string;
      companySize?: string;
      country?: string;
      description?: string;
      supportEmail?: string;
      workspaceName?: string;
    }) => {
      const token = await getToken();
      return companyApi.onboardCompany(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Company onboarded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to onboard company');
    },
  });
}

export function useUsage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['company', 'usage'],
    queryFn: async () => {
      const token = await getToken();
      return companyApi.getUsage(token);
    },
    enabled: isLoaded && isSignedIn,
  });
}
