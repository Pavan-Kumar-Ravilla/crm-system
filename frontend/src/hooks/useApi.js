import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

/**
 * Generic API hook for GET requests with caching
 */
export const useApiQuery = (key, queryFn, options = {}) => {
  return useQuery(
    key,
    queryFn,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 401
        if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 401) {
          return false;
        }
        return failureCount < 2;
      },
      onError: (error) => {
        // Only show toast for unexpected errors (not handled by interceptor)
        if (!error?.response && error?.code !== 'ERR_NETWORK') {
          toast.error('An unexpected error occurred');
        }
      },
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
      // Only show error toast if not handled by interceptor
      if (!error?.response) {
        const message = error?.message || 'An unexpected error occurred';
        toast.error(message);
      }
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