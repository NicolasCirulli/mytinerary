import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itinerariesService } from '../services/itineraries.services';
import type { Itinerary } from '../types/itineraries.types';

export const useUpdateItinerary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Itinerary> }) => 
      itinerariesService.updateItinerary(id, data),
    onSuccess: () => {
      // Invalidate itineraries queries. Since we don't know the exact cityId here easily,
      // invalidating all itineraries is a safe approach. Alternatively, if the backend returns the full itinerary,
      // we could check the city ID. But invalidating by the base key is simpler.
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
    },
    onError: (error) => {
      console.error('Failed to update itinerary:', error);
    },
  });
};