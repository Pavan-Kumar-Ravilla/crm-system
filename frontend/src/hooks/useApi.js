import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from '@/services/apiClient';
import toast from 'react-hot-toast';

/**
 * Generic API hook for GET requests with caching
 */
export const useApiQuery = (key, endpoint, options = {}) => {
  return useQuery(
    key,
    async () => {
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      ...options
    }
  );
};

/**
 * Generic API hook for mutations (POST, PUT, DELETE)
 */
export const useApiMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation(mutationFn, {
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(message);
    },
    onSuccess: (data, variables, context) => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(key => {
          queryClient.invalidateQueries(key);
        });
      }
    },
    ...options
  });
};
