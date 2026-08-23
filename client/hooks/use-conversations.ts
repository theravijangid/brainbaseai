import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getConversations, getConversationDetails, updateConversationStatus, deleteConversation } from '../api/conversations.api';
import { toast } from 'sonner';

export const useConversations = (workspaceId: string, status?: string, type?: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['conversations', workspaceId, status, type],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getConversations(token, workspaceId, status, type);
    },
    enabled: !!workspaceId,
    refetchInterval: 10000, // Refetch every 10s to see new messages
  });
};

export const useConversationDetails = (workspaceId: string, conversationId: string) => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['conversation', workspaceId, conversationId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getConversationDetails(token, workspaceId, conversationId);
    },
    enabled: !!workspaceId && !!conversationId,
  });
};

export const useUpdateConversationStatus = (workspaceId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string, status: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return updateConversationStatus(token, workspaceId, conversationId, status);
    },
    onSuccess: (updatedConversation, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['conversation', workspaceId, variables.conversationId] });
      toast.success('Conversation status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update conversation status');
    },
  });
};

export const useDeleteConversation = (workspaceId: string) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return deleteConversation(token, workspaceId, conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', workspaceId] });
      toast.success('Conversation deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete conversation');
    },
  });
};

