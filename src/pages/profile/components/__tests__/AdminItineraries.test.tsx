import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AdminItineraries } from '../AdminItineraries';
import type { City } from '@shared/types/api.types';
import type { Itinerary } from '@features/itineraries/types/itineraries.types';

// --- Datos mock ---

const mockCities: City[] = [
  {
    _id: '64abc123',
    name: 'Buenos Aires',
    country: 'Argentina',
    description: 'Vibrant capital city',
    image: 'https://example.com/ba.jpg',
    currency: 'ARS',
    language: 'Spanish',
    averageRating: 4.5,
  },
  {
    _id: '64def456',
    name: 'Santiago',
    country: 'Chile',
    description: 'City between mountains',
    image: 'https://example.com/scl.jpg',
    currency: 'CLP',
    language: 'Spanish',
    averageRating: 4.2,
  },
];

const mockItineraries: Itinerary[] = [
  {
    _id: 'itr001',
    title: 'Buenos Aires Walking Tour',
    price: 3,
    guide: 'Maria Lopez',
    duration: 4,
    hashtags: ['#walking', '#culture'],
    guide_image: 'https://example.com/guide-maria.jpg',
    description: 'Explore vibrant Buenos Aires.',
    activities: ['Plaza de Mayo', 'San Telmo'],
    city: '64abc123',
  },
];

// --- Mocks ---

vi.mock('@features/cities/hooks/useCities', () => ({
  useCities: vi.fn(),
}));

vi.mock('@features/itineraries/hooks/useCityItineraries', () => ({
  useCityItineraries: vi.fn(),
}));

vi.mock('@features/itineraries/hooks/useUpdateItinerary', () => ({
  useUpdateItinerary: vi.fn(),
}));

vi.mock('@features/itineraries/hooks/useCreateItinerary', () => ({
  useCreateItinerary: vi.fn(),
}));

import { useCities } from '@features/cities/hooks/useCities';
import { useCityItineraries } from '@features/itineraries/hooks/useCityItineraries';
import { useUpdateItinerary } from '@features/itineraries/hooks/useUpdateItinerary';
import { useCreateItinerary } from '@features/itineraries/hooks/useCreateItinerary';

const mockUseCities = useCities as ReturnType<typeof vi.fn>;
const mockUseCityItineraries = useCityItineraries as ReturnType<typeof vi.fn>;
const mockUseUpdateItinerary = useUpdateItinerary as ReturnType<typeof vi.fn>;
const mockUseCreateItinerary = useCreateItinerary as ReturnType<typeof vi.fn>;

function renderAdminItineraries() {
  return render(
    <MemoryRouter>
      <AdminItineraries />
    </MemoryRouter>,
  );
}

describe('AdminItineraries — create mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: cities loaded, no city selected, no itineraries
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
      data: mockItineraries,
      isPending: false,
    });

    mockUseUpdateItinerary.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    mockUseCreateItinerary.mockReturnValue({
      mutate: vi.fn((_vars: unknown, options?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });
  });

  it('should render "Create New Itinerary" button in list mode (AC1)', async () => {
    renderAdminItineraries();

    // Seleccionar una ciudad para ver la lista
    const select = screen.getByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(select, '64abc123');

    // El botón "Create New Itinerary" debe estar presente en la vista de lista
    // -- FALLA: el botón no existe aún en la implementación (TDD red) --
    const createButton = screen.getByRole('button', { name: /create new itinerary/i });
    expect(createButton).toBeInTheDocument();
  });

  it('should show creation form after clicking "Create New Itinerary" (AC2)', async () => {
    renderAdminItineraries();

    const select = screen.getByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(select, '64abc123');

    // Click en el botón de crear
    // -- FALLA: el botón no existe aún (TDD red) --
    const createButton = screen.getByRole('button', { name: /create new itinerary/i });
    await user.click(createButton);

    // Debe aparecer el formulario de creación
    // -- FALLA: el formulario no existe aún (TDD red) --
    expect(screen.getByRole('heading', { name: /create/i })).toBeInTheDocument();
  });

  it('should render expected form fields: title, guide, description, price, duration, guide_image (AC3)', async () => {
    renderAdminItineraries();

    const select = screen.getByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(select, '64abc123');

    // Navegar al formulario de creación
    // -- FALLA: el botón no existe aún (TDD red) --
    const createButton = screen.getByRole('button', { name: /create new itinerary/i });
    await user.click(createButton);

    // Verificar que los campos esperados están presentes
    // -- FALLA: los campos no existen aún (TDD red) --
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Guide')).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guide image/i)).toBeInTheDocument();
  });

  it('should return to list view on successful submit (AC4)', async () => {
    // -- FALLA: ni el botón ni el formulario existen aún (TDD red) --
    renderAdminItineraries();

    const select = screen.getByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(select, '64abc123');

    // Click en Crear
    const createButton = screen.getByRole('button', { name: /create new itinerary/i });
    await user.click(createButton);

    // Llenar campos del formulario
    await user.type(screen.getByLabelText(/title/i), 'New Tour');
    await user.type(screen.getByLabelText('Guide'), 'John Guide');
    await user.type(screen.getByLabelText(/description/i), 'A great tour');
    await user.type(screen.getByLabelText(/price/i), '3');
    await user.type(screen.getByLabelText(/duration/i), '4');
    await user.type(screen.getByLabelText(/guide image/i), 'https://example.com/img.jpg');

    // Submit via form
    const form = document.querySelector('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    // Debe volver a la vista de lista (el heading principal debe ser visible)
    expect(screen.getByRole('heading', { name: /itineraries management/i })).toBeInTheDocument();
  });
});
