import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.services';

export const useItineraryActivities = (itineraryId: string | undefined) => {
  return useQuery({
    queryKey: ['itineraries', itineraryId, 'activities'],
    queryFn: () => activitiesService.getActivitiesByItinerary(itineraryId!),
    enabled: !!itineraryId,
  });
};
