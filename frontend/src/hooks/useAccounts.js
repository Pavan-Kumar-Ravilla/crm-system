import { useApiQuery, useApiMutation } from './useApi';
import { apiClient } from '@/services/apiClient';

export const useAccounts = (params = {}) => {
  return useApiQuery(
    ['accounts', params],
    `/accounts?${new URLSearchParams(params).toString()}`,
    {
      keepPreviousData: true
    }
  );
};

export const useAccount = (id) => {
  return useApiQuery(
    ['account', id],
    `/accounts/${id}`,
    {
      enabled: !!id
    }
  );
};

export const useCreateAccount = () => {
  return useApiMutation(
    async (data) => {
      const response = await apiClient.post('/accounts', data);
      return response.data;
    },
    {
      successMessage: 'Account created successfully',
      invalidateQueries: [['accounts'], ['account-stats']]
    }
  );
};

export const useUpdateAccount = () => {
  return useApiMutation(
    async ({ id, data }) => {
      const response = await apiClient.put(`/accounts/${id}`, data);
      return response.data;
    },
    {
      successMessage: 'Account updated successfully',
      invalidateQueries: [['accounts'], ['account'], ['account-stats']]
    }
  );
};

export const useDeleteAccount = () => {
  return useApiMutation(
    async (id) => {
      const response = await apiClient.delete(`/accounts/${id}`);
      return response.data;
    },
    {
      successMessage: 'Account deleted successfully',
      invalidateQueries: [['accounts'], ['account-stats']]
    }
  );
};

export const useAccountStats = (params = {}) => {
  return useApiQuery(
    ['account-stats', params],
    `/accounts/stats?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 10 * 60 * 1000
    }
  );
};

export const useAccountSummary = (id) => {
  return useApiQuery(
    ['account-summary', id],
    `/accounts/${id}/summary`,
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000
    }
  );
};

export const useAccountHierarchy = (id) => {
  return useApiQuery(
    ['account-hierarchy', id],
    `/accounts/${id}/hierarchy`,
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000
    }
  );
};