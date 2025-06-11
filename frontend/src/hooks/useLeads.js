import { useApiQuery, useApiMutation } from './useApi';
import { leadService } from '../services/leadService';

export const useLeads = (params = {}) => {
  return useApiQuery(
    ['leads', params],
    () => leadService.getLeads(params),
    {
      keepPreviousData: true
    }
  );
};

export const useLead = (id) => {
  return useApiQuery(
    ['lead', id],
    () => leadService.getLead(id),
    {
      enabled: !!id
    }
  );
};

export const useCreateLead = () => {
  return useApiMutation(
    (data) => leadService.createLead(data),
    {
      successMessage: 'Lead created successfully',
      invalidateQueries: [['leads'], ['lead-stats']]
    }
  );
};

export const useUpdateLead = () => {
  return useApiMutation(
    ({ id, data }) => leadService.updateLead(id, data),
    {
      successMessage: 'Lead updated successfully',
      invalidateQueries: [['leads'], ['lead'], ['lead-stats']]
    }
  );
};

export const useDeleteLead = () => {
  return useApiMutation(
    (id) => leadService.deleteLead(id),
    {
      successMessage: 'Lead deleted successfully',
      invalidateQueries: [['leads'], ['lead-stats']]
    }
  );
};

export const useConvertLead = () => {
  return useApiMutation(
    ({ id, conversionData }) => leadService.convertLead(id, conversionData),
    {
      successMessage: 'Lead converted successfully',
      invalidateQueries: [['leads'], ['contacts'], ['accounts'], ['opportunities']]
    }
  );
};

export const useLeadStats = (params = {}) => {
  return useApiQuery(
    ['lead-stats', params],
    () => leadService.getLeadStats(params),
    {
      staleTime: 10 * 60 * 1000 // 10 minutes for stats
    }
  );
};