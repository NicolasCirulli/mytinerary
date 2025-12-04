import type { Itinerary } from "@features/intineraries/itineraries.types"

interface City {
    _id: string
    name: string
    country: string
    description: string
    image: string
    currency: string
    language: string
    averageRating: number,
    itineraries: Itinerary[]
}

interface AxiosCityResponse {
    data: City[]
}


export type { City, AxiosCityResponse };