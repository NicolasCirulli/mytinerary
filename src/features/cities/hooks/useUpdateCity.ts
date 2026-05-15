import { useMutation, useQueryClient } from '@tanstack/react-query';
import { citiesService } from '../services/cities.services';
import type { City } from '@shared/types/api.types';

export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<City> }) => 
      citiesService.updateCity(id, data),
    onSuccess: (updatedCity, variables) => {
      // Invalidate both the list and the specific city detail
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['city', variables.id] });
    },
    onError: (error) => {
      console.error('Failed to update city:', error);
    },
  });
};