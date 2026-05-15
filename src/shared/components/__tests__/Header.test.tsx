import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { useAuthStore } from '@features/auth/store/auth.store';
import { MemoryRouter } from 'react-router';

// Mock de NavIcons para facilitar la búsqueda en el DOM
vi.mock('@shared/icons/NavIcons', () => ({
  HomeIcon: () => <span data-testid="home-icon" />,
  GlobeIcon: () => <span data-testid="globe-icon" />,
  UserIcon: () => <span data-testid="user-icon" />,
  LogInIcon: () => <span data-testid="login-icon" />,
  UserPlusIcon: () => <span data-testid="register-icon" />,
  LogOutIcon: () => <span data-testid="logout-icon" />,
}));

const mockUser = {
  _id: '123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  image: 'https://example.com/photo.jpg',
  country: 'Argentina',
  whishlist: []
};

describe('Header Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHeader = () => {
    return render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  };

  it('should render navigation links for unauthenticated user (Desktop & Mobile)', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    renderHeader();

    // Verificamos que existan al menos 2 links de Home (Desktop + Mobile Drawer)
    const homeLinks = screen.getAllByText(/home/i);
    expect(homeLinks.length).toBeGreaterThanOrEqual(2);
    
    // Verificamos iconos
    expect(screen.getAllByTestId('home-icon').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByTestId('globe-icon').length).toBeGreaterThanOrEqual(2);

    // Deben aparecer Login y Register en ambos menús
    expect(screen.getAllByText(/login/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/register/i).length).toBeGreaterThanOrEqual(2);
  });

  it('should render user profile images when authenticated', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    renderHeader();

    // Hay varias imágenes con alt relativo al perfil (Desktop dropdown, Mobile Top Bar, Mobile Drawer)
    // El alt exacto varía, vamos a usar getAllByAltText con regex
    const profileImages = screen.getAllByAltText(/profile/i);
    expect(profileImages.length).toBeGreaterThanOrEqual(1);
    
    // Verificamos que al menos una tenga la URL correcta
    expect(profileImages.some(img => img.getAttribute('src') === mockUser.image)).toBe(true);
  });

  it('should NOT show Login/Register links when authenticated', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    renderHeader();

    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/register/i)).not.toBeInTheDocument();
  });

  it('should show Profile link when authenticated', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    renderHeader();

    // Debe haber links a perfil (Desktop dropdown + Mobile Drawer)
    const profileLinks = screen.getAllByText(/profile/i);
    expect(profileLinks.length).toBeGreaterThanOrEqual(1);
  });
});
