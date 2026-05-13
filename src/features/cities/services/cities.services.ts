import API from "@shared/api/api";
import type { AxiosCityResponse, City } from "../cities.types";

export const fetchCities = async (): Promise<City[]> => {
  const response: AxiosCityResponse = await API.get("/cities");
  return response.data;
};

export const fetchCityById = async (id: string): Promise<City> => {
  const response = await API.get(`/cities/${id}`);
  return response.data;
};
