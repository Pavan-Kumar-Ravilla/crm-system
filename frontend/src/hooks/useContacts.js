import { useApiQuery, useApiMutation } from './useApi';
import { apiClient } from '@/services/apiClient';

export const useContacts = (params = {}) => {
  return useApiQuery(
    ['contacts', params],
    `/contacts?${new URLSearchParams(params).toString()}`,
    {
      keepPreviousData: true
    }
  );
};

export const useContact = (id) => {
  return useApiQuery(
    ['contact', id],
    `/contacts/${id}`,
    {
      enabled: !!id
    }
  );
};

export const useCreateContact = () => {
  return useApiMutation(
    async (data) => {
      const response = await apiClient.post('/contacts', data);
      return response.data;
    },
    {
      successMessage: 'Contact created successfully',
      invalidateQueries: [['contacts'], ['contact-stats']]
    }
  );
};

export const useUpdateContact = () => {
  return useApiMutation(
    async ({ id, data }) => {
      const response = await apiClient.put(`/contacts/${id}`, data);
      return response.data;
    },
    {
      successMessage: 'Contact updated successfully',
      invalidateQueries: [['contacts'], ['contact'], ['contact-stats']]
    }
  );
};

export const useDeleteContact = () => {
  return useApiMutation(
    async (id) => {
      const response = await apiClient.delete(`/contacts/${id}`);
      return response.data;
    },
    {
      successMessage: 'Contact deleted successfully',
      invalidateQueries: [['contacts'], ['contact-stats']]
    }
  );
};

export const useContactStats = (params = {}) => {
  return useApiQuery(
    ['contact-stats', params],
    `/contacts/stats?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 10 * 60 * 1000
    }
  );
};

export const useContactsByAccount = (accountId) => {
  return useApiQuery(
    ['contacts', 'by-account', accountId],
    `/contacts/by-account/${accountId}`,
    {
      enabled: !!accountId,
      staleTime: 2 * 60 * 1000 // 2 minutes
    }
  );
};

export const useContactHierarchy = (accountId) => {
  return useApiQuery(
    ['contact-hierarchy', accountId],
    `/contacts/hierarchy/${accountId}`,
    {
      enabled: !!accountId,
      staleTime: 5 * 60 * 1000
    }
  );
};