import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { citiesService } from '../services/cities.services';
import type { City } from '@shared/types/api.types';

export interface CityFilter {
    name?: string;
    country?: string;
}

function filterCities(cities: City[], filter: CityFilter): City[] {
    if (!filter || Object.keys(filter).length === 0) {
        return cities;
    }

    return cities.filter((city) => {
        return Object.entries(filter).every(([key, value]) => {
            const func = functions[key as keyof CityFilter];
            return func ? func(city, value as string) : true;
        });
    });
}

const functions = {
    name: (city: City, name: string) => city.name.toLowerCase().includes(name.toLowerCase()),
    country: (city: City, country: string) => city.country.toLowerCase().includes(country.toLowerCase()),
};

export const useCities = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const { data: cities = [], isPending, isError, error } = useQuery({
        queryKey: ['cities'],
        queryFn: citiesService.getAllCities,
    });

    const filteredCities = useMemo(() => {
        return filterCities(cities, { name: searchTerm });
    }, [cities, searchTerm]);

    return { 
        cities, 
        loading: isPending, // For backward compatibility if needed, though we should prefer isPending
        isPending,
        isError, 
        error: error ? error.message : null, 
        filteredCities, 
        searchTerm, 
        setSearchTerm 
    };
};

export default useCities;