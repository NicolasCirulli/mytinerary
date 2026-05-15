import type { Itinerary } from "@features/itineraries/types/itineraries.types";

export interface ApiResponse<T> {
  status: number;
  statusMsg: string;
  data: T;
}

export interface ApiError {
  error: true;
  status: number;
  statusMsg: string;
}

export interface City {
  _id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  currency: string;
  language: string;
  averageRating: number;
  itineraries?: Itinerary[];
}
