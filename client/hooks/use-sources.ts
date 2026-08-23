import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { sourcesApi } from '../api/sources.api';
import { toast } from 'sonner';

export function useUploadSource(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const token = await getToken();
      return sourcesApi.uploadSourceFile(workspaceId, file, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'sources'] });
      toast.success('Source uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload source file');
    },
  });
}

export function useRegisterUrlSource(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: { url: string, name?: string, type: 'website' | 'youtube' }) => {
      const token = await getToken();
      return sourcesApi.registerUrlSource(workspaceId, payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'sources'] });
      toast.success('URL source registered successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to register URL source');
    },
  });
}

export function useDeleteSource(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      const token = await getToken();
      return sourcesApi.deleteSource(workspaceId, sourceId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'sources'] });
      toast.success('Source deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete source');
    },
  });
}

export function useRetrySource(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      const token = await getToken();
      return sourcesApi.retrySource(workspaceId, sourceId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'sources'] });
      toast.success('Source queued for retry');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to retry source');
    },
  });
}

export function useSourceViewBlob(workspaceId: string, sourceId: string | undefined) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['source-view-blob', workspaceId, sourceId],
    queryFn: async () => {
      if (!sourceId) return null;
      const token = await getToken();
      return sourcesApi.getSourceViewBlob(workspaceId, sourceId, token);
    },
    enabled: !!workspaceId && !!sourceId && isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

export function useSources(workspaceId: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  
  const pollingIntervalStr = process.env.NEXT_PUBLIC_POLLING_INTERVAL;
  const POLLING_INTERVAL = pollingIntervalStr ? parseInt(pollingIntervalStr, 10) : 5000;

  return useQuery({
    queryKey: ['workspaces', workspaceId, 'sources'],
    queryFn: async () => {
      const token = await getToken();
      return sourcesApi.getSources(workspaceId, token);
    },
    enabled: !!workspaceId && isLoaded && isSignedIn,
    refetchInterval: (query) => {
      const data = query.state?.data;
      if (!data) return false;
      const isProcessing = data.some(
        (s) => s.status !== 'READY' && s.status !== 'FAILED'
      );
      return isProcessing ? POLLING_INTERVAL : false;
    },
  });
}

export function useSyncSource(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      const token = await getToken();
      return sourcesApi.syncSource(workspaceId, sourceId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'sources'] });
      toast.success('Source sync queued');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sync source');
    },
  });
}

