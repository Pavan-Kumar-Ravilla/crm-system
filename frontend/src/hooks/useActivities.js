import { useApiQuery, useApiMutation } from './useApi';
import { activityService } from '../services/activityService';

export const useActivities = (params = {}) => {
  return useApiQuery(
    ['activities', params],
    () => activityService.getActivities(params),
    {
      keepPreviousData: true
    }
  );
};

export const useActivity = (id) => {
  return useApiQuery(
    ['activity', id],
    () => activityService.getActivity(id),
    {
      enabled: !!id
    }
  );
};

export const useCreateActivity = () => {
  return useApiMutation(
    (data) => activityService.createActivity(data),
    {
      successMessage: 'Activity created successfully',
      invalidateQueries: [['activities'], ['activity-stats'], ['upcoming-activities'], ['overdue-activities']]
    }
  );
};

export const useUpdateActivity = () => {
  return useApiMutation(
    ({ id, data }) => activityService.updateActivity(id, data),
    {
      successMessage: 'Activity updated successfully',
      invalidateQueries: [['activities'], ['activity'], ['activity-stats']]
    }
  );
};

export const useDeleteActivity = () => {
  return useApiMutation(
    (id) => activityService.deleteActivity(id),
    {
      successMessage: 'Activity deleted successfully',
      invalidateQueries: [['activities'], ['activity-stats']]
    }
  );
};

export const useCompleteActivity = () => {
  return useApiMutation(
    ({ id, outcome, nextSteps }) => activityService.completeActivity(id, outcome, nextSteps),
    {
      successMessage: 'Activity marked as completed',
      invalidateQueries: [['activities'], ['activity'], ['activity-stats']]
    }
  );
};

export const useActivityStats = (params = {}) => {
  return useApiQuery(
    ['activity-stats', params],
    () => activityService.getActivityStats(params),
    {
      staleTime: 10 * 60 * 1000
    }
  );
};

export const useUpcomingActivities = (params = {}) => {
  return useApiQuery(
    ['upcoming-activities', params],
    () => activityService.getUpcomingActivities(params),
    {
      staleTime: 1 * 60 * 1000 // 1 minute for upcoming activities
    }
  );
};

export const useOverdueActivities = (params = {}) => {
  return useApiQuery(
    ['overdue-activities', params],
    () => activityService.getOverdueActivities(params),
    {
      staleTime: 1 * 60 * 1000
    }
  );
};