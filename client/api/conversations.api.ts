import { apiConnector } from '../lib/api-client';

export interface Conversation {
  id: string;
  workspaceId: string;
  title: string;
  supportAgentId?: string;
  status: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  supportAgent?: {
    id: string;
    name: string;
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export const getConversations = async (token: string | null, workspaceId: string, status?: string, type?: string): Promise<Conversation[]> => {
  const queryParams = new URLSearchParams();
  if (status && status !== 'All') queryParams.append('status', status);
  if (type) queryParams.append('type', type);
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiConnector.get<Conversation[]>(`/workspaces/${workspaceId}/conversations${query}`, token);
};

export const getConversationDetails = async (token: string | null, workspaceId: string, conversationId: string): Promise<Conversation> => {
  return apiConnector.get<Conversation>(`/workspaces/${workspaceId}/conversations/${conversationId}`, token);
};

export const updateConversationStatus = async (token: string | null, workspaceId: string, conversationId: string, status: string): Promise<Conversation> => {
  return apiConnector.put<Conversation>(`/workspaces/${workspaceId}/conversations/${conversationId}`, { status }, token);
};

export const deleteConversation = async (token: string | null, workspaceId: string, conversationId: string): Promise<void> => {
  return apiConnector.delete<void>(`/workspaces/${workspaceId}/conversations/${conversationId}`, token);
};
