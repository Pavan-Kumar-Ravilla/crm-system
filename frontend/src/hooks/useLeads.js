import { useApiQuery, useApiMutation } from './useApi';
import { apiClient } from '@/services/apiClient';

export const useLeads = (params = {}) => {
  return useApiQuery(
    ['leads', params],
    `/leads?${new URLSearchParams(params).toString()}`,
    {
      keepPreviousData: true
    }
  );
};

export const useLead = (id) => {
  return useApiQuery(
    ['lead', id],
    `/leads/${id}`,
    {
      enabled: !!id
    }
  );
};

export const useCreateLead = () => {
  return useApiMutation(
    async (data) => {
      const response = await apiClient.post('/leads', data);
      return response.data;
    },
    {
      successMessage: 'Lead created successfully',
      invalidateQueries: [['leads'], ['lead-stats']]
    }
  );
};

export const useUpdateLead = () => {
  return useApiMutation(
    async ({ id, data }) => {
      const response = await apiClient.put(`/leads/${id}`, data);
      return response.data;
    },
    {
      successMessage: 'Lead updated successfully',
      invalidateQueries: [['leads'], ['lead'], ['lead-stats']]
    }
  );
};

export const useDeleteLead = () => {
  return useApiMutation(
    async (id) => {
      const response = await apiClient.delete(`/leads/${id}`);
      return response.data;
    },
    {
      successMessage: 'Lead deleted successfully',
      invalidateQueries: [['leads'], ['lead-stats']]
    }
  );
};

export const useConvertLead = () => {
  return useApiMutation(
    async ({ id, conversionData }) => {
      const response = await apiClient.post(`/leads/${id}/convert`, conversionData);
      return response.data;
    },
    {
      successMessage: 'Lead converted successfully',
      invalidateQueries: [['leads'], ['contacts'], ['accounts'], ['opportunities']]
    }
  );
};

export const useLeadStats = (params = {}) => {
  return useApiQuery(
    ['lead-stats', params],
    `/leads/stats?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 10 * 60 * 1000 // 10 minutes for stats
    }
  );
};

export const useBulkUpdateLeads = () => {
  return useApiMutation(
    async ({ leadIds, updates }) => {
      const response = await apiClient.put('/leads/bulk-update', { leadIds, updates });
      return response.data;
    },
    {
      successMessage: 'Leads updated successfully',
      invalidateQueries: [['leads'], ['lead-stats']]
    }
  );
};

export const useBulkDeleteLeads = () => {
  return useApiMutation(
    async (leadIds) => {
      const response = await apiClient.delete('/leads/bulk-delete', { data: { leadIds } });
      return response.data;
    },
    {
      successMessage: 'Leads deleted successfully',
      invalidateQueries: [['leads'], ['lead-stats']]
    }
  );
};