import { apiConnector } from '../lib/api-client';

export const agentsApi = {
  listAgents: async (workspaceId: string, token: string | null): Promise<any[]> => {
    return apiConnector.get<any[]>(`/workspaces/${workspaceId}/agents`, token);
  },

  getAgent: async (workspaceId: string, agentId: string, token: string | null): Promise<any> => {
    return apiConnector.get<any>(`/workspaces/${workspaceId}/agents/${agentId}`, token);
  },

  createAgent: async (workspaceId: string, data: any, token: string | null): Promise<any> => {
    return apiConnector.post<any>(`/workspaces/${workspaceId}/agents`, data, token);
  },

  updateAgent: async (workspaceId: string, agentId: string, data: any, token: string | null): Promise<any> => {
    return apiConnector.put<any>(`/workspaces/${workspaceId}/agents/${agentId}`, data, token);
  }
};
