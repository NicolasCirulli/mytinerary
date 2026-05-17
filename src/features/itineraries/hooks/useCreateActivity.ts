import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.services';
import type { CreateActivityData } from '../types/itineraries.types';

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itineraryId, data }: { itineraryId: string; data: CreateActivityData }) =>
      activitiesService.createActivity(itineraryId, data),
    onSuccess: (_data, variables) => {
      // Solo invalidar activities, NO itineraries general
      queryClient.invalidateQueries({ queryKey: ['itineraries', variables.itineraryId, 'activities'] });
    },
    onError: (error) => {
      console.error('Failed to create activity:', error);
    },
  });
};
