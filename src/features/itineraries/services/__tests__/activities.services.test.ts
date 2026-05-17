import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@shared/api/api';
import { activitiesService } from '../activities.services';
import type { Activity, CreateActivityData } from '../../types/itineraries.types';

vi.mock('@shared/api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPost = api.post as ReturnType<typeof vi.fn>;
const mockPut = api.put as ReturnType<typeof vi.fn>;
const mockDelete = api.delete as ReturnType<typeof vi.fn>;

const mockActivity: Activity = {
  _id: 'act001',
  name: 'Visita a la Torre Eiffel',
  description: 'Recorrido guiado por la Torre Eiffel con acceso prioritario.',
  image: 'https://example.com/eiffel.jpg',
  duration: 90,
};

const mockActivities: Activity[] = [
  mockActivity,
  {
    _id: 'act002',
    name: 'Paseo por el Sena',
    description: 'Crucero panorámico por el río Sena al atardecer.',
    image: 'https://example.com/sena.jpg',
    duration: 60,
  },
];

const mockCreateData: CreateActivityData = {
  name: 'Visita a la Torre Eiffel',
  description: 'Recorrido guiado por la Torre Eiffel con acceso prioritario.',
  image: 'https://example.com/eiffel.jpg',
  duration: 90,
};

const itineraryId = 'itr001';
const activityId = 'act001';

describe('activitiesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActivitiesByItinerary', () => {
    it('should return Activity[] on successful GET', async () => {
      mockGet.mockResolvedValue({
        status: 200,
        statusMsg: 'success',
        data: mockActivities,
      });

      const result = await activitiesService.getActivitiesByItinerary(itineraryId);

      expect(result).toEqual(mockActivities);
      expect(mockGet).toHaveBeenCalledWith(`/itineraries/${itineraryId}/activities`);
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when itinerary is not found (404)', async () => {
      const apiError = {
        response: {
          status: 404,
          data: { statusMsg: 'Itinerary not found' },
        },
      };
      mockGet.mockRejectedValue(apiError);

      await expect(
        activitiesService.getActivitiesByItinerary('nonexistent'),
      ).rejects.toEqual(apiError);
    });
  });

  describe('createActivity', () => {
    it('should return Activity on successful POST', async () => {
      mockPost.mockResolvedValue({
        status: 201,
        statusMsg: 'created',
        data: mockActivity,
      });

      const result = await activitiesService.createActivity(itineraryId, mockCreateData);

      expect(result).toEqual(mockActivity);
      expect(mockPost).toHaveBeenCalledWith(
        `/itineraries/${itineraryId}/activities`,
        mockCreateData,
      );
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when request body is invalid (400)', async () => {
      const apiError = {
        response: {
          status: 400,
          data: { statusMsg: 'Validation failed: name is required' },
        },
      };
      mockPost.mockRejectedValue(apiError);

      await expect(
        activitiesService.createActivity(itineraryId, { name: '' } as CreateActivityData),
      ).rejects.toEqual(apiError);
    });
  });

  describe('updateActivity', () => {
    it('should return updated Activity on successful PUT', async () => {
      const updateData = { name: 'Torre Eiffel VIP', duration: 120 };
      const updatedActivity: Activity = { ...mockActivity, ...updateData };
      mockPut.mockResolvedValue({
        status: 200,
        statusMsg: 'success',
        data: updatedActivity,
      });

      const result = await activitiesService.updateActivity(itineraryId, activityId, updateData);

      expect(result).toEqual(updatedActivity);
      expect(mockPut).toHaveBeenCalledWith(
        `/itineraries/${itineraryId}/activities/${activityId}`,
        updateData,
      );
      expect(mockPut).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when activity is not found (404)', async () => {
      const apiError = {
        response: {
          status: 404,
          data: { statusMsg: 'Activity not found' },
        },
      };
      mockPut.mockRejectedValue(apiError);

      await expect(
        activitiesService.updateActivity(itineraryId, 'nonexistent', { name: 'Test' }),
      ).rejects.toEqual(apiError);
    });
  });

  describe('deleteActivity', () => {
    it('should succeed on DELETE without error', async () => {
      mockDelete.mockResolvedValue({
        status: 200,
        statusMsg: 'success',
        data: null,
      });

      await expect(
        activitiesService.deleteActivity(itineraryId, activityId),
      ).resolves.not.toThrow();

      expect(mockDelete).toHaveBeenCalledWith(
        `/itineraries/${itineraryId}/activities/${activityId}`,
      );
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when activity is not found (404)', async () => {
      const apiError = {
        response: {
          status: 404,
          data: { statusMsg: 'Activity not found' },
        },
      };
      mockDelete.mockRejectedValue(apiError);

      await expect(
        activitiesService.deleteActivity(itineraryId, 'nonexistent'),
      ).rejects.toEqual(apiError);
    });
  });
});
