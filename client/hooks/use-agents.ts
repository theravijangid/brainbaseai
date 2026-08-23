import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { agentsApi } from '../api/agents.api';
import { toast } from 'sonner';

export const useAgents = (workspaceId: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['agents', workspaceId],
    queryFn: async () => {
      const token = await getToken();
      return agentsApi.listAgents(workspaceId, token);
    },
    enabled: !!workspaceId,
  });
};

export const useAgent = (workspaceId: string, agentId: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['agent', workspaceId, agentId],
    queryFn: async () => {
      const token = await getToken();
      return agentsApi.getAgent(workspaceId, agentId, token);
    },
    enabled: !!workspaceId && !!agentId,
  });
};

export const useCreateAgent = (workspaceId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      return agentsApi.createAgent(workspaceId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', workspaceId] });
      toast.success('Agent created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create agent');
    },
  });
};

export const useUpdateAgent = (workspaceId: string, agentId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      return agentsApi.updateAgent(workspaceId, agentId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', workspaceId, agentId] });
      queryClient.invalidateQueries({ queryKey: ['agents', workspaceId] });
      toast.success('Agent updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update agent');
    },
  });
};
