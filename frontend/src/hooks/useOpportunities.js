import { useApiQuery, useApiMutation } from './useApi';
import { apiClient } from '@/services/apiClient';

export const useOpportunities = (params = {}) => {
  return useApiQuery(
    ['opportunities', params],
    `/opportunities?${new URLSearchParams(params).toString()}`,
    {
      keepPreviousData: true
    }
  );
};

export const useOpportunity = (id) => {
  return useApiQuery(
    ['opportunity', id],
    `/opportunities/${id}`,
    {
      enabled: !!id
    }
  );
};

export const useCreateOpportunity = () => {
  return useApiMutation(
    async (data) => {
      const response = await apiClient.post('/opportunities', data);
      return response.data;
    },
    {
      successMessage: 'Opportunity created successfully',
      invalidateQueries: [['opportunities'], ['opportunity-stats'], ['pipeline']]
    }
  );
};

export const useUpdateOpportunity = () => {
  return useApiMutation(
    async ({ id, data }) => {
      const response = await apiClient.put(`/opportunities/${id}`, data);
      return response.data;
    },
    {
      successMessage: 'Opportunity updated successfully',
      invalidateQueries: [['opportunities'], ['opportunity'], ['opportunity-stats'], ['pipeline']]
    }
  );
};

export const useDeleteOpportunity = () => {
  return useApiMutation(
    async (id) => {
      const response = await apiClient.delete(`/opportunities/${id}`);
      return response.data;
    },
    {
      successMessage: 'Opportunity deleted successfully',
      invalidateQueries: [['opportunities'], ['opportunity-stats'], ['pipeline']]
    }
  );
};

export const useOpportunityStats = (params = {}) => {
  return useApiQuery(
    ['opportunity-stats', params],
    `/opportunities/stats?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 10 * 60 * 1000
    }
  );
};

export const usePipelineData = (params = {}) => {
  return useApiQuery(
    ['pipeline', params],
    `/opportunities/pipeline?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 5 * 60 * 1000
    }
  );
};

export const useForecastData = (params = {}) => {
  return useApiQuery(
    ['forecast', params],
    `/opportunities/forecast?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 10 * 60 * 1000
    }
  );
};