import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.services';
import type { CreateActivityData } from '../types/itineraries.types';

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, activityId, data }: { itineraryId: string; activityId: string; data: Partial<CreateActivityData> }) =>
      activitiesService.updateActivity(itineraryId, activityId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', variables.itineraryId, 'activities'] });
    },
    onError: (error) => {
      console.error('Failed to update activity:', error);
    },
  });
};
