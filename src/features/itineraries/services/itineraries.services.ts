import api from "@shared/api/api";
import type { ApiResponse } from "@shared/types/api.types";
import type { Itinerary, CreateItineraryData } from "../types/itineraries.types";

export const itinerariesService = {
  getItinerariesByCity: async (cityId: string): Promise<Itinerary[]> => {
    const response = await api.get<never, ApiResponse<Itinerary[]>>(`/itineraries/city/${cityId}`);
    return response.data;
  },
  updateItinerary: async (id: string, data: Partial<Itinerary>): Promise<Itinerary> => {
    const response = await api.put<never, ApiResponse<Itinerary>>(`/itineraries/${id}`, data);
    return response.data;
  },
  createItinerary: async (cityId: string, data: CreateItineraryData): Promise<Itinerary> => {
    const response = await api.post<never, ApiResponse<Itinerary>>(`/itineraries/city/${cityId}`, data);
    return response.data;
  },
};