import { apiConnector } from '../lib/api-client';
import { Company } from '../lib/types';

export const companyApi = {
  getCompany: async (token: string | null): Promise<Company | null> => {
    return apiConnector.get<Company | null>('/companies/me', token);
  },

  updateCompany: async (
    data: {
      name?: string;
      website?: string;
      industry?: string;
      companySize?: string;
      country?: string;
      description?: string;
      supportEmail?: string;
    },
    token: string | null
  ): Promise<Company> => {
    return apiConnector.put<Company>('/companies/me', data, token);
  },

  onboardCompany: async (
    data: {
      name: string;
      website?: string;
      industry?: string;
      companySize?: string;
      country?: string;
      description?: string;
      supportEmail?: string;
      workspaceName?: string;
    },
    token: string | null
  ): Promise<Company> => {
    return apiConnector.post<Company>('/companies/onboard', data, token);
  },

  getUsage: async (token: string | null): Promise<any> => {
    return apiConnector.get<any>('/companies/usage', token);
  },
};
