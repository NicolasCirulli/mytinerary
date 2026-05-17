import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteActivity } from '../useDeleteActivity';
import { activitiesService } from '../../services/activities.services';

vi.mock('../../services/activities.services', () => ({
  activitiesService: {
    getActivitiesByItinerary: vi.fn(),
    createActivity: vi.fn(),
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
  },
}));

const mockDeleteActivity = activitiesService.deleteActivity as ReturnType<typeof vi.fn>;

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

describe('useDeleteActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call activitiesService.deleteActivity with itineraryId and activityId', async () => {
    mockDeleteActivity.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteActivity(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ itineraryId, activityId });
    });

    expect(mockDeleteActivity).toHaveBeenCalledWith(itineraryId, activityId);
    expect(mockDeleteActivity).toHaveBeenCalledTimes(1);
  });

  it('should invalidate ["itineraries", itineraryId, "activities"] queries on success', async () => {
    mockDeleteActivity.mockResolvedValue(undefined);

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

    const { result } = renderHook(() => useDeleteActivity(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ itineraryId, activityId });
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
    mockDeleteActivity.mockRejectedValue(apiError);

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

    const { result } = renderHook(() => useDeleteActivity(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({ itineraryId, activityId });
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
