import { useState, useEffect, useMemo } from 'react'
import { fetchCities } from '../services/cities.services'
import type { City } from '../cities.types'

export interface CityFilter{
    name?: string;
    country?: string;
}

function filterCities(cities: City[],  filter: CityFilter): City[] {
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
}

export const useCities = () => {
    const [cities, setCities] = useState<City[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] =  useState("")

    useEffect(() => {
        fetchCities().then((response) => {
            setCities(response)
        }).catch((err) => {
            setError(err.message || 'Error fetching cities')
        }).finally(() => {
            setLoading(false)
        })
    }, [])

     const filteredCities = useMemo(() => {
        return filterCities(cities, {name : searchTerm })
    }, [cities, searchTerm])

   

    return { cities, loading, error, filteredCities, searchTerm, setSearchTerm }
}

export default useCities
