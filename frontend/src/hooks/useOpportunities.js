import { useApiQuery, useApiMutation } from './useApi';
import { opportunityService } from '../services/opportunityService';

export const useOpportunities = (params = {}) => {
  return useApiQuery(
    ['opportunities', params],
    () => opportunityService.getOpportunities(params),
    {
      keepPreviousData: true
    }
  );
};

export const useOpportunity = (id) => {
  return useApiQuery(
    ['opportunity', id],
    () => opportunityService.getOpportunity(id),
    {
      enabled: !!id
    }
  );
};

export const useCreateOpportunity = () => {
  return useApiMutation(
    (data) => opportunityService.createOpportunity(data),
    {
      successMessage: 'Opportunity created successfully',
      invalidateQueries: [['opportunities'], ['opportunity-stats'], ['pipeline']]
    }
  );
};

export const useUpdateOpportunity = () => {
  return useApiMutation(
    ({ id, data }) => opportunityService.updateOpportunity(id, data),
    {
      successMessage: 'Opportunity updated successfully',
      invalidateQueries: [['opportunities'], ['opportunity'], ['opportunity-stats'], ['pipeline']]
    }
  );
};

export const useDeleteOpportunity = () => {
  return useApiMutation(
    (id) => opportunityService.deleteOpportunity(id),
    {
      successMessage: 'Opportunity deleted successfully',
      invalidateQueries: [['opportunities'], ['opportunity-stats'], ['pipeline']]
    }
  );
};

export const useOpportunityStats = (params = {}) => {
  return useApiQuery(
    ['opportunity-stats', params],
    () => opportunityService.getOpportunityStats(params),
    {
      staleTime: 10 * 60 * 1000
    }
  );
};

export const usePipelineData = (params = {}) => {
  return useApiQuery(
    ['pipeline', params],
    () => opportunityService.getPipelineData(params),
    {
      staleTime: 5 * 60 * 1000
    }
  );
};