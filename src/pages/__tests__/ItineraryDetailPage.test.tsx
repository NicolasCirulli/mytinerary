import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ItineraryDetailPage } from '../itineraries/ItineraryDetailPage';
import type { Itinerary, Activity } from '@features/itineraries/types/itineraries.types';

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
  _id: 'itr001',
  title: 'Classic Paris Tour',
  price: 4,
  guide: 'Sofia',
  duration: 6,
  hashtags: ['#Paris', '#EiffelTower'],
  guide_image: 'https://example.com/sofia.jpg',
  description: 'Un tour clásico por París.',
  activities: mockActivities,
  city: 'city001',
};

const mockItineraryNoActivities: Itinerary = {
  _id: 'itr002',
  title: 'Simple Tour',
  price: 2,
  guide: 'Carlos',
  duration: 3,
  hashtags: ['#simple'],
  guide_image: 'https://example.com/carlos.jpg',
  description: 'Un tour sencillo.',
  activities: [],
  city: 'city002',
};

// Mock useParams to control the itinerary id per test
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// Mock useItineraryActivities hook
vi.mock('@features/itineraries/hooks/useItineraryActivities', () => ({
  useItineraryActivities: vi.fn(),
}));

import { useParams } from 'react-router';
import { useItineraryActivities } from '@features/itineraries/hooks/useItineraryActivities';

const mockUseParams = useParams as ReturnType<typeof vi.fn>;
const mockUseItineraryActivities = useItineraryActivities as ReturnType<typeof vi.fn>;

function renderItineraryDetailPage(queryClient: QueryClient) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ItineraryDetailPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ItineraryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: empty activities
    mockUseItineraryActivities.mockReturnValue({
      data: [],
      isPending: false,
    });
  });

  it('should display itinerary information (title, guide, price, duration)', () => {
    mockUseParams.mockReturnValue({ id: 'itr001' });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(['itineraries'], [mockItinerary]);

    renderItineraryDetailPage(queryClient);

    // -- FALLA: el componente no existe aún (TDD red) --
    expect(screen.getByText('Classic Paris Tour')).toBeInTheDocument();
    expect(screen.getByText(/sofia/i)).toBeInTheDocument();
    expect(screen.getByText(/premium/i)).toBeInTheDocument(); // price level 4 label
    expect(screen.getByText(/6\s*hours/i)).toBeInTheDocument();
  });

  it('should display list of activities when they exist', () => {
    mockUseParams.mockReturnValue({ id: 'itr001' });

    // Provide activities via the mocked hook
    mockUseItineraryActivities.mockReturnValue({
      data: mockActivities,
      isPending: false,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(['itineraries'], [mockItinerary]);

    renderItineraryDetailPage(queryClient);

    // -- FALLA: el componente no existe aún (TDD red) --
    expect(screen.getByText('Visita a la Torre Eiffel')).toBeInTheDocument();
    expect(screen.getByText('Paseo por el Sena')).toBeInTheDocument();
  });

  it('should display message when there are no activities', () => {
    mockUseParams.mockReturnValue({ id: 'itr002' });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(['itineraries'], [mockItineraryNoActivities]);

    renderItineraryDetailPage(queryClient);

    // -- FALLA: el componente no existe aún (TDD red) --
    const noActivitiesElements = screen.getAllByText(/no activities/i);
    expect(noActivitiesElements.length).toBeGreaterThanOrEqual(1);
  });
});
