import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateItinerary } from '../useCreateItinerary';
import { itinerariesService } from '../../services/itineraries.services';
import type { Itinerary, CreateItineraryData } from '../../types/itineraries.types';

vi.mock('../../services/itineraries.services', () => ({
  itinerariesService: {
    getItinerariesByCity: vi.fn(),
    updateItinerary: vi.fn(),
    createItinerary: vi.fn(),
  },
}));

const mockCreateItinerary = itinerariesService.createItinerary as ReturnType<typeof vi.fn>;

const mockItinerary: Itinerary = {
  _id: '64def456',
  title: 'Buenos Aires Walking Tour',
  price: 3,
  guide: 'Maria Lopez',
  duration: 4,
  hashtags: ['#walking', '#culture'],
  guide_image: 'https://example.com/guide-maria.jpg',
  description: 'Explore the vibrant streets of Buenos Aires with a local guide.',
  activities: ['Plaza de Mayo', 'San Telmo Market', 'La Boca'],
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
  activities: ['Plaza de Mayo', 'San Telmo Market', 'La Boca'],
};

const cityId = '64abc123';

function createWrapper(): (props: { children: ReactNode }) => ReactNode {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useCreateItinerary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call itinerariesService.createItinerary with cityId and data', async () => {
    mockCreateItinerary.mockResolvedValue(mockItinerary);

    const { result } = renderHook(() => useCreateItinerary(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ cityId, data: mockCreateData });
    });

    expect(mockCreateItinerary).toHaveBeenCalledWith(cityId, mockCreateData);
    expect(mockCreateItinerary).toHaveBeenCalledTimes(1);
  });

  it('should invalidate ["itineraries"] queries on success', async () => {
    mockCreateItinerary.mockResolvedValue(mockItinerary);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }

    const { result } = renderHook(() => useCreateItinerary(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ cityId, data: mockCreateData });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['itineraries'] });
  });

  it('should NOT invalidate queries on error', async () => {
    const apiError = {
      response: {
        status: 400,
        data: { statusMsg: 'Validation failed' },
      },
    };
    mockCreateItinerary.mockRejectedValue(apiError);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }

    const { result } = renderHook(() => useCreateItinerary(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ cityId, data: mockCreateData });
      } catch {
        // Expected - mutation should fail
      }
    });

    // Invalidate should NOT be called on error
    const invalidateCalls = invalidateSpy.mock.calls.filter(
      (call) => JSON.stringify(call[0]) === JSON.stringify({ queryKey: ['itineraries'] }),
    );
    expect(invalidateCalls).toHaveLength(0);
  });
});
