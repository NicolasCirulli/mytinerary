import { useState, useEffect } from 'react'
import { fetchCities } from '../services/cities.services'
import type { City } from '../cities.types'
export const useFechCities = () => {
    const [cities, setCities] = useState<City[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchCities().then((response) => {
            setCities(response)
        }).catch((err) => {
            setError(err.message || 'Error fetching cities')
        }).finally(() => {
            setLoading(false)
        })
    }, [])
    return { cities, loading, error }
}

export default useFechCities
