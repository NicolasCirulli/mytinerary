import { useQuery } from '@tanstack/react-query';
import { itinerariesService } from '../services/itineraries.services';

export const useCityItineraries = (cityId: string | undefined) => {
    return useQuery({
        queryKey: ['itineraries', 'city', cityId],
        queryFn: () => itinerariesService.getItinerariesByCity(cityId!),
        enabled: !!cityId,
    });
};