import { useApiQuery, useApiMutation } from './useApi';
import { accountService } from '../services/accountService';

export const useAccounts = (params = {}) => {
  return useApiQuery(
    ['accounts', params],
    () => accountService.getAccounts(params),
    {
      keepPreviousData: true
    }
  );
};

export const useAccount = (id) => {
  return useApiQuery(
    ['account', id],
    () => accountService.getAccount(id),
    {
      enabled: !!id
    }
  );
};

export const useCreateAccount = () => {
  return useApiMutation(
    (data) => accountService.createAccount(data),
    {
      successMessage: 'Account created successfully',
      invalidateQueries: [['accounts'], ['account-stats']]
    }
  );
};

export const useUpdateAccount = () => {
  return useApiMutation(
    ({ id, data }) => accountService.updateAccount(id, data),
    {
      successMessage: 'Account updated successfully',
      invalidateQueries: [['accounts'], ['account'], ['account-stats']]
    }
  );
};

export const useDeleteAccount = () => {
  return useApiMutation(
    (id) => accountService.deleteAccount(id),
    {
      successMessage: 'Account deleted successfully',
      invalidateQueries: [['accounts'], ['account-stats']]
    }
  );
};

export const useAccountStats = (params = {}) => {
  return useApiQuery(
    ['account-stats', params],
    () => accountService.getAccountStats(params),
    {
      staleTime: 10 * 60 * 1000
    }
  );
};