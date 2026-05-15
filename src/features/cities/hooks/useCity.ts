import { useQuery } from '@tanstack/react-query';
import { citiesService } from '../services/cities.services';

export const useCity = (id: string | undefined) => {
    return useQuery({
        queryKey: ['city', id],
        queryFn: () => citiesService.getCityById(id!),
        enabled: !!id,
    });
};

export default useCity;