import api from "@shared/api/api";
import type { ApiResponse } from "@shared/types/api.types";
import type { Activity, CreateActivityData } from "../types/itineraries.types";

export const activitiesService = {
  getActivitiesByItinerary: async (itineraryId: string): Promise<Activity[]> => {
    const response = await api.get<never, ApiResponse<Activity[]>>(`/itineraries/${itineraryId}/activities`);
    return response.data;
  },
  createActivity: async (itineraryId: string, data: CreateActivityData): Promise<Activity> => {
    const response = await api.post<never, ApiResponse<Activity>>(`/itineraries/${itineraryId}/activities`, data);
    return response.data;
  },
  updateActivity: async (itineraryId: string, activityId: string, data: Partial<CreateActivityData>): Promise<Activity> => {
    const response = await api.put<never, ApiResponse<Activity>>(`/itineraries/${itineraryId}/activities/${activityId}`, data);
    return response.data;
  },
  deleteActivity: async (itineraryId: string, activityId: string): Promise<void> => {
    await api.delete<never, ApiResponse<void>>(`/itineraries/${itineraryId}/activities/${activityId}`);
  },
};
