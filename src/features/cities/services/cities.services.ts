import API from "@shared/api/api"
import type { AxiosCityResponse, City } from "../cities.types";

export const fetchCities = async (): Promise<City[]> => {
    const response:AxiosCityResponse = await API.get("/cities")
    console.log(response);
    return response.data;
}