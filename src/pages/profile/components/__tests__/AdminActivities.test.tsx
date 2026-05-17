import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AdminActivities } from '../AdminActivities';
import type { City } from '@shared/types/api.types';
import type { Itinerary, Activity } from '@features/itineraries/types/itineraries.types';

// --- Datos mock ---

const mockCities: City[] = [
  {
    _id: 'city001',
    name: 'Paris',
    country: 'France',
    description: 'City of Light',
    image: 'https://example.com/paris.jpg',
    currency: 'EUR',
    language: 'French',
    averageRating: 4.7,
  },
  {
    _id: 'city002',
    name: 'Buenos Aires',
    country: 'Argentina',
    description: 'Vibrant capital city',
    image: 'https://example.com/ba.jpg',
    currency: 'ARS',
    language: 'Spanish',
    averageRating: 4.5,
  },
];

const mockItineraries: Itinerary[] = [
  {
    _id: 'itr001',
    title: 'Classic Paris Tour',
    price: 4,
    guide: 'Sofia',
    duration: 6,
    hashtags: ['#Paris', '#EiffelTower'],
    guide_image: 'https://example.com/sofia.jpg',
    description: 'Un tour clásico por París.',
    activities: [],
    city: 'city001',
  },
];

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

// --- Mocks ---

vi.mock('@features/cities/hooks/useCities', () => ({
  useCities: vi.fn(),
}));

vi.mock('@features/itineraries/hooks/useCityItineraries', () => ({
  useCityItineraries: vi.fn(),
}));

vi.mock('@features/itineraries/hooks/useItineraryActivities', () => ({
  useItineraryActivities: vi.fn(),
}));

vi.mock('@features/itineraries/hooks/useCreateActivity', () => ({
  useCreateActivity: vi.fn(),
}));

vi.mock('@features/itineraries/hooks/useUpdateActivity', () => ({
  useUpdateActivity: vi.fn(),
}));

vi.mock('@features/itineraries/hooks/useDeleteActivity', () => ({
  useDeleteActivity: vi.fn(),
}));

import { useCities } from '@features/cities/hooks/useCities';
import { useCityItineraries } from '@features/itineraries/hooks/useCityItineraries';
import { useItineraryActivities } from '@features/itineraries/hooks/useItineraryActivities';
import { useCreateActivity } from '@features/itineraries/hooks/useCreateActivity';
import { useUpdateActivity } from '@features/itineraries/hooks/useUpdateActivity';
import { useDeleteActivity } from '@features/itineraries/hooks/useDeleteActivity';

const mockUseCities = useCities as ReturnType<typeof vi.fn>;
const mockUseCityItineraries = useCityItineraries as ReturnType<typeof vi.fn>;
const mockUseItineraryActivities = useItineraryActivities as ReturnType<typeof vi.fn>;
const mockUseCreateActivity = useCreateActivity as ReturnType<typeof vi.fn>;
const mockUseUpdateActivity = useUpdateActivity as ReturnType<typeof vi.fn>;
const mockUseDeleteActivity = useDeleteActivity as ReturnType<typeof vi.fn>;

function renderAdminActivities(preselectedItineraryId?: string) {
  return render(
    <MemoryRouter>
      <AdminActivities preselectedItineraryId={preselectedItineraryId} />
    </MemoryRouter>,
  );
}

describe('AdminActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks: cities loaded, no city selected, no itineraries
    mockUseCities.mockReturnValue({
      cities: mockCities,
      isPending: false,
      loading: false,
      isError: false,
      error: null,
      filteredCities: mockCities,
      searchTerm: '',
      setSearchTerm: vi.fn(),
    });

    mockUseCityItineraries.mockReturnValue({
      data: [],
      isPending: false,
    });

    mockUseItineraryActivities.mockReturnValue({
      data: [],
      isPending: false,
    });

    // H2: hooks no longer receive itineraryId at instantiation
    mockUseCreateActivity.mockReturnValue({
      mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });

    mockUseUpdateActivity.mockReturnValue({
      mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });

    mockUseDeleteActivity.mockReturnValue({
      mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });
  });

  it('should render city selector', () => {
    renderAdminActivities();

    // Exactly one combobox (city selector) when no city selected
    // -- FALLA: el selector de ciudad no existe aún (TDD red) --
    const selectors = screen.getAllByRole('combobox');
    expect(selectors.length).toBeGreaterThanOrEqual(1);
  });

  it('should render itinerary selector after selecting a city', async () => {
    mockUseCityItineraries.mockReturnValue({
      data: mockItineraries,
      isPending: false,
    });

    renderAdminActivities();

    const selectors = screen.getAllByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(selectors[0], 'city001');

    // After city selection, two selectors should appear (city + itinerary)
    // -- FALLA: el selector de itinerario no se renderiza aún (TDD red) --
    const allSelectors = screen.getAllByRole('combobox');
    expect(allSelectors.length).toBeGreaterThanOrEqual(2);
  });

  it('should show activities table when data exists', async () => {
    mockUseCityItineraries.mockReturnValue({
      data: mockItineraries,
      isPending: false,
    });

    mockUseItineraryActivities.mockReturnValue({
      data: mockActivities,
      isPending: false,
    });

    renderAdminActivities();

    const selectors = screen.getAllByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(selectors[0], 'city001');

    // -- FALLA: la tabla de actividades no existe aún (TDD red) --
    expect(screen.getByText('Visita a la Torre Eiffel')).toBeInTheDocument();
    expect(screen.getByText('Paseo por el Sena')).toBeInTheDocument();
  });

  it('should have "Add Activity" button', () => {
    renderAdminActivities();

    // -- FALLA: el botón "Add Activity" no existe aún (TDD red) --
    expect(screen.getByRole('button', { name: /add activity/i })).toBeInTheDocument();
  });

  it('should show activity form fields after clicking "Add Activity"', async () => {
    renderAdminActivities();

    const user = userEvent.setup();

    // -- FALLA: el botón no existe aún (TDD red) --
    const addButton = screen.getByRole('button', { name: /add activity/i });
    await user.click(addButton);

    // -- FALLA: los campos del formulario no existen aún (TDD red) --
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/image/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
  });

  it('should have delete button for each activity row', async () => {
    mockUseCityItineraries.mockReturnValue({
      data: mockItineraries,
      isPending: false,
    });

    mockUseItineraryActivities.mockReturnValue({
      data: mockActivities,
      isPending: false,
    });

    renderAdminActivities();

    const selectors = screen.getAllByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(selectors[0], 'city001');

    // -- FALLA: los botones de eliminar no existen aún (TDD red) --
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(mockActivities.length);
  });

  it('should show empty state message when there are no activities', async () => {
    mockUseCityItineraries.mockReturnValue({
      data: mockItineraries,
      isPending: false,
    });

    mockUseItineraryActivities.mockReturnValue({
      data: [],
      isPending: false,
    });

    renderAdminActivities();

    const selectors = screen.getAllByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(selectors[0], 'city001');

    // -- FALLA: el mensaje de estado vacío no existe aún (TDD red) --
    expect(screen.getByText(/no activities/i)).toBeInTheDocument();
  });
});
