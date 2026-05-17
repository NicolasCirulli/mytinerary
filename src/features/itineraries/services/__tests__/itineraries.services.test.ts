import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@shared/api/api';
import { itinerariesService } from '../itineraries.services';
import type { Itinerary, CreateItineraryData, Activity } from '../../types/itineraries.types';

vi.mock('@shared/api/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const mockPost = api.post as ReturnType<typeof vi.fn>;
const mockGet = api.get as ReturnType<typeof vi.fn>;
const mockPut = api.put as ReturnType<typeof vi.fn>;

const mockActivities: Activity[] = [
  {
    _id: 'act001',
    name: 'Visita a la Torre Eiffel',
    description: 'Recorrido guiado por la Torre Eiffel con acceso prioritario.',
    image: 'https://example.com/eiffel.jpg',
    duration: 90,
  },
  {
    _id: 'act002',
    name: 'Paseo por el Sena',
    description: 'Crucero panorámico por el río Sena al atardecer.',
    image: 'https://example.com/sena.jpg',
    duration: 60,
  },
];

const mockItinerary: Itinerary = {
  _id: '64def456',
  title: 'Buenos Aires Walking Tour',
  price: 3,
  guide: 'Maria Lopez',
  duration: 4,
  hashtags: ['#walking', '#culture'],
  guide_image: 'https://example.com/guide-maria.jpg',
  description: 'Explore the vibrant streets of Buenos Aires with a local guide.',
  activities: mockActivities,
  city: '64abc123',
};

const mockCreateData: CreateItineraryData = {
  title: 'Buenos Aires Walking Tour',
  price: 3,
  guide: 'Maria Lopez',
  duration: 4,
  hashtags: ['#walking', '#culture'],
  guide_image: 'https://example.com/guide-maria.jpg',
  description: 'Explore the vibrant streets of Buenos Aires with a local guide.',
};

const cityId = '64abc123';

describe('itinerariesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createItinerary', () => {
    it('should return Itinerary on successful POST (201)', async () => {
      mockPost.mockResolvedValue({
        status: 201,
        statusMsg: 'created',
        data: mockItinerary,
      });

      const result = await itinerariesService.createItinerary(cityId, mockCreateData);

      expect(result).toEqual(mockItinerary);
      expect(mockPost).toHaveBeenCalledWith(`/itineraries/city/${cityId}`, mockCreateData);
      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when cityId is invalid (404)', async () => {
      const apiError = {
        response: {
          status: 404,
          data: { statusMsg: 'City not found' },
        },
      };
      mockPost.mockRejectedValue(apiError);

      await expect(
        itinerariesService.createItinerary('nonexistentCity', mockCreateData),
      ).rejects.toEqual(apiError);
    });

    it('should propagate error when request body is invalid (400)', async () => {
      const apiError = {
        response: {
          status: 400,
          data: { statusMsg: 'Validation failed: title is required' },
        },
      };
      mockPost.mockRejectedValue(apiError);

      await expect(
        itinerariesService.createItinerary(cityId, { title: '' } as CreateItineraryData),
      ).rejects.toEqual(apiError);
    });
  });
});
