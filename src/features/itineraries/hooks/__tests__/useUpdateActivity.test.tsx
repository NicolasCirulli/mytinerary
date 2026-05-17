import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateActivity } from '../useUpdateActivity';
import { activitiesService } from '../../services/activities.services';
import type { Activity } from '../../types/itineraries.types';

vi.mock('../../services/activities.services', () => ({
  activitiesService: {
    getActivitiesByItinerary: vi.fn(),
    createActivity: vi.fn(),
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
  },
}));

const mockUpdateActivity = activitiesService.updateActivity as ReturnType<typeof vi.fn>;

const mockActivity: Activity = {
  _id: 'act001',
  name: 'Visita a la Torre Eiffel',
  description: 'Recorrido guiado por la Torre Eiffel con acceso prioritario.',
  image: 'https://example.com/eiffel.jpg',
  duration: 90,
};

const itineraryId = 'itr001';
const activityId = 'act001';

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

describe('useUpdateActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call activitiesService.updateActivity with itineraryId, activityId and data', async () => {
    const updateData = { name: 'Torre Eiffel VIP', duration: 120 };
    const updatedActivity: Activity = { ...mockActivity, ...updateData };
    mockUpdateActivity.mockResolvedValue(updatedActivity);

    const { result } = renderHook(() => useUpdateActivity(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ itineraryId, activityId, data: updateData });
    });

    expect(mockUpdateActivity).toHaveBeenCalledWith(itineraryId, activityId, updateData);
    expect(mockUpdateActivity).toHaveBeenCalledTimes(1);
  });

  it('should invalidate ["itineraries", itineraryId, "activities"] queries on success', async () => {
    mockUpdateActivity.mockResolvedValue(mockActivity);

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

    const { result } = renderHook(() => useUpdateActivity(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ itineraryId, activityId, data: { name: 'Updated' } });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['itineraries', itineraryId, 'activities'],
    });
  });

  it('should NOT invalidate queries on error', async () => {
    const apiError = {
      response: {
        status: 404,
        data: { statusMsg: 'Activity not found' },
      },
    };
    mockUpdateActivity.mockRejectedValue(apiError);

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

    const { result } = renderHook(() => useUpdateActivity(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ itineraryId, activityId, data: { name: 'Updated' } });
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
