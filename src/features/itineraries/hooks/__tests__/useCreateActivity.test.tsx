import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateActivity } from '../useCreateActivity';
import { activitiesService } from '../../services/activities.services';
import type { Activity, CreateActivityData } from '../../types/itineraries.types';

vi.mock('../../services/activities.services', () => ({
  activitiesService: {
    getActivitiesByItinerary: vi.fn(),
    createActivity: vi.fn(),
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
  },
}));

const mockCreateActivity = activitiesService.createActivity as ReturnType<typeof vi.fn>;

const mockActivity: Activity = {
  _id: 'act001',
  name: 'Visita a la Torre Eiffel',
  description: 'Recorrido guiado por la Torre Eiffel con acceso prioritario.',
  image: 'https://example.com/eiffel.jpg',
  duration: 90,
};

const mockCreateData: CreateActivityData = {
  name: 'Visita a la Torre Eiffel',
  description: 'Recorrido guiado por la Torre Eiffel con acceso prioritario.',
  image: 'https://example.com/eiffel.jpg',
  duration: 90,
};

const itineraryId = 'itr001';

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

describe('useCreateActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call activitiesService.createActivity with itineraryId and data', async () => {
    mockCreateActivity.mockResolvedValue(mockActivity);

    const { result } = renderHook(() => useCreateActivity(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ itineraryId, data: mockCreateData });
    });

    expect(mockCreateActivity).toHaveBeenCalledWith(itineraryId, mockCreateData);
    expect(mockCreateActivity).toHaveBeenCalledTimes(1);
  });

  it('should invalidate ["itineraries", itineraryId, "activities"] queries on success', async () => {
    mockCreateActivity.mockResolvedValue(mockActivity);

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

    const { result } = renderHook(() => useCreateActivity(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ itineraryId, data: mockCreateData });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['itineraries', itineraryId, 'activities'],
    });
  });

  it('should NOT invalidate queries on error', async () => {
    const apiError = {
      response: {
        status: 400,
        data: { statusMsg: 'Validation failed' },
      },
    };
    mockCreateActivity.mockRejectedValue(apiError);

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

    const { result } = renderHook(() => useCreateActivity(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ itineraryId, data: mockCreateData });
      } catch {
        // Expected - mutation should fail
      }
    });

    const invalidateCalls = invalidateSpy.mock.calls.filter(
      (call) =>
        JSON.stringify(call[0]) ===
        JSON.stringify({ queryKey: ['itineraries', itineraryId, 'activities'] }),
    );
    expect(invalidateCalls).toHaveLength(0);
  });
});
