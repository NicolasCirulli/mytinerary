import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itinerariesService } from '../services/itineraries.services';
import type { CreateItineraryData } from '../types/itineraries.types';

export const useCreateItinerary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cityId, data }: { cityId: string; data: CreateItineraryData }) =>
      itinerariesService.createItinerary(cityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
    },
    onError: (error) => {
      console.error('Failed to create itinerary:', error);
    },
  });
};
