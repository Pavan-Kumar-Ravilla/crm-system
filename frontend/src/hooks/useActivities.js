import { useApiQuery, useApiMutation } from './useApi';
import { apiClient } from '@/services/apiClient';

export const useActivities = (params = {}) => {
  return useApiQuery(
    ['activities', params],
    `/activities?${new URLSearchParams(params).toString()}`,
    {
      keepPreviousData: true
    }
  );
};

export const useActivity = (id) => {
  return useApiQuery(
    ['activity', id],
    `/activities/${id}`,
    {
      enabled: !!id
    }
  );
};

export const useCreateActivity = () => {
  return useApiMutation(
    async (data) => {
      const response = await apiClient.post('/activities', data);
      return response.data;
    },
    {
      successMessage: 'Activity created successfully',
      invalidateQueries: [['activities'], ['activity-stats'], ['upcoming-activities'], ['overdue-activities']]
    }
  );
};

export const useUpdateActivity = () => {
  return useApiMutation(
    async ({ id, data }) => {
      const response = await apiClient.put(`/activities/${id}`, data);
      return response.data;
    },
    {
      successMessage: 'Activity updated successfully',
      invalidateQueries: [['activities'], ['activity'], ['activity-stats']]
    }
  );
};

export const useDeleteActivity = () => {
  return useApiMutation(
    async (id) => {
      const response = await apiClient.delete(`/activities/${id}`);
      return response.data;
    },
    {
      successMessage: 'Activity deleted successfully',
      invalidateQueries: [['activities'], ['activity-stats']]
    }
  );
};

export const useCompleteActivity = () => {
  return useApiMutation(
    async ({ id, outcome, nextSteps }) => {
      const response = await apiClient.put(`/activities/${id}/complete`, { outcome, nextSteps });
      return response.data;
    },
    {
      successMessage: 'Activity marked as completed',
      invalidateQueries: [['activities'], ['activity'], ['activity-stats']]
    }
  );
};

export const useActivityStats = (params = {}) => {
  return useApiQuery(
    ['activity-stats', params],
    `/activities/stats?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 10 * 60 * 1000
    }
  );
};

export const useUpcomingActivities = (params = {}) => {
  return useApiQuery(
    ['upcoming-activities', params],
    `/activities/upcoming?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 1 * 60 * 1000 // 1 minute for upcoming activities
    }
  );
};

export const useOverdueActivities = (params = {}) => {
  return useApiQuery(
    ['overdue-activities', params],
    `/activities/overdue?${new URLSearchParams(params).toString()}`,
    {
      staleTime: 1 * 60 * 1000
    }
  );
};
