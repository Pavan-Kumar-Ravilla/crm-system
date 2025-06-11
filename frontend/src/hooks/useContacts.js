import { useApiQuery, useApiMutation } from './useApi';
import { contactService } from '../services/contactService';

export const useContacts = (params = {}) => {
  return useApiQuery(
    ['contacts', params],
    () => contactService.getContacts(params),
    {
      keepPreviousData: true
    }
  );
};

export const useContact = (id) => {
  return useApiQuery(
    ['contact', id],
    () => contactService.getContact(id),
    {
      enabled: !!id
    }
  );
};

export const useCreateContact = () => {
  return useApiMutation(
    (data) => contactService.createContact(data),
    {
      successMessage: 'Contact created successfully',
      invalidateQueries: [['contacts'], ['contact-stats']]
    }
  );
};

export const useUpdateContact = () => {
  return useApiMutation(
    ({ id, data }) => contactService.updateContact(id, data),
    {
      successMessage: 'Contact updated successfully',
      invalidateQueries: [['contacts'], ['contact'], ['contact-stats']]
    }
  );
};

export const useDeleteContact = () => {
  return useApiMutation(
    (id) => contactService.deleteContact(id),
    {
      successMessage: 'Contact deleted successfully',
      invalidateQueries: [['contacts'], ['contact-stats']]
    }
  );
};

export const useContactStats = (params = {}) => {
  return useApiQuery(
    ['contact-stats', params],
    () => contactService.getContactStats(params),
    {
      staleTime: 10 * 60 * 1000
    }
  );
};