import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.services';

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, activityId }: { itineraryId: string; activityId: string }) =>
      activitiesService.deleteActivity(itineraryId, activityId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['itineraries', variables.itineraryId, 'activities'] });
    },
    onError: (error) => {
      console.error('Failed to delete activity:', error);
    },
  });
};
