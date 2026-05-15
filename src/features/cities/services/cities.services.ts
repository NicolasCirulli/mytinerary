import api from "@shared/api/api";
import type { City, ApiResponse } from "@shared/types/api.types";

export const citiesService = {
  getAllCities: async (): Promise<City[]> => {
    const response = await api.get<never, ApiResponse<City[]>>("/cities");
    return response.data;
  },
  getCityById: async (id: string): Promise<City> => {
    const response = await api.get<never, ApiResponse<City>>(`/cities/${id}`);
    return response.data;
  },
  updateCity: async (id: string, data: Partial<City>): Promise<City> => {
    const response = await api.put<never, ApiResponse<City>>(`/cities/${id}`, data);
    return response.data;
  },
};
