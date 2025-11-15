import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import NavBar, { NavBarProps } from './NavBar';
import { useAuth } from '@/hooks/useAuth';
import { AuthContextType } from '@/context/AuthContext';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth');
const mockUseAuth = vi.mocked(useAuth);

// Helper function to render component with router
const renderWithRouter = (props: NavBarProps = {}, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <NavBar {...props} />
    </MemoryRouter>
  );
};

describe('NavBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: unauthenticated user
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      signup: vi.fn(),
      loginWithGoogle: vi.fn(),
      signupWithGoogle: vi.fn(),
      logout: vi.fn(),
    } as AuthContextType);
  });

  describe('Rendering', () => {
    it('should render navbar', () => {
      renderWithRouter();
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('should render logo', () => {
      renderWithRouter();
      const logo = screen.getByTestId('navbar-logo');
      expect(logo).toBeInTheDocument();
      // Logo now uses ImageLoader component
      const logoImage = logo.querySelector('img');
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute('alt', 'Planet Path Logo');
    });

    it('should render logo text on desktop', () => {
      renderWithRouter();
      const logo = screen.getByTestId('navbar-logo');
      expect(logo).toHaveTextContent('Planet Path');
    });

    it('should render mobile menu button', () => {
      renderWithRouter();
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated Navigation', () => {
    it('should show Courses, About, and Login links when not authenticated', () => {
      renderWithRouter();
      expect(screen.getByTestId('nav-link-/catalog')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/login')).toBeInTheDocument();
    });

    it('should not show avatar dropdown when not authenticated', () => {
      renderWithRouter();
      expect(screen.queryByTestId('user-menu-button')).not.toBeInTheDocument();
    });
  });

  describe('Student Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u-1', name: 'John Student', role: 'student' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        signupWithGoogle: vi.fn(),
        logout: vi.fn(),
      } as AuthContextType);
    });

    it('should show student navigation links', () => {
      renderWithRouter();
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/catalog')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/dashboard')).toBeInTheDocument();
    });

    it('should show avatar dropdown for student', () => {
      renderWithRouter();
      expect(screen.getByTestId('user-menu-button')).toBeInTheDocument();
    });
  });

  describe('Instructor Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u-2', name: 'Jane Instructor', role: 'instructor' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        signupWithGoogle: vi.fn(),
        logout: vi.fn(),
      } as AuthContextType);
    });

    it('should show instructor navigation links', () => {
      renderWithRouter();
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/catalog')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/instructor')).toBeInTheDocument();
    });

    it('should not show Dashboard link for instructor', () => {
      renderWithRouter();
      expect(screen.queryByTestId('nav-link-/dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Admin Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u-3', name: 'Admin User', role: 'admin' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        signupWithGoogle: vi.fn(),
        logout: vi.fn(),
      } as AuthContextType);
    });

    it('should show admin navigation links', () => {
      renderWithRouter();
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
      // Use getAllByTestId since admin link appears in both desktop and mobile
      const adminLinks = screen.getAllByTestId('nav-link-/admin');
      expect(adminLinks.length).toBeGreaterThan(0);
      expect(adminLinks[0]).toHaveAttribute('href', '/admin');
      
      const reportsLinks = screen.getAllByTestId('nav-link-/admin/reports');
      expect(reportsLinks.length).toBeGreaterThan(0);
      expect(reportsLinks[0]).toHaveAttribute('href', '/admin/reports');
    });

    it('should not show Courses or Dashboard links for admin', () => {
      renderWithRouter();
      expect(screen.queryByTestId('nav-link-/catalog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-/dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Active Link Highlighting', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u-1', name: 'Test User', role: 'student' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        signupWithGoogle: vi.fn(),
        logout: vi.fn(),
      } as AuthContextType);
    });

    it('should highlight active link based on current route', () => {
      renderWithRouter({}, ['/dashboard']);
      const dashboardLink = screen.getByTestId('nav-link-/dashboard');
      expect(dashboardLink).toHaveClass('bg-planet-green-dark');
      expect(dashboardLink).toHaveClass('text-white');
    });

    it('should highlight Courses link when on /catalog', () => {
      renderWithRouter({}, ['/catalog']);
      const coursesLink = screen.getByTestId('nav-link-/catalog');
      expect(coursesLink).toHaveClass('bg-planet-green-dark');
    });
  });

  describe('Mobile Menu', () => {
    it('should show hamburger icon when menu is closed', () => {
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');
      const hamburgerIcon = menuButton.querySelector('svg');
      expect(hamburgerIcon).toBeInTheDocument();
    });

    it('should toggle mobile menu when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');
      const mobileMenu = screen.getByTestId('mobile-menu');

      // Menu should be closed initially
      expect(mobileMenu).toHaveClass('max-h-0');

      // Click to open
      await user.click(menuButton);
      expect(mobileMenu).toHaveClass('max-h-96');

      // Click to close
      await user.click(menuButton);
      expect(mobileMenu).toHaveClass('max-h-0');
    });

    it('should show close icon when menu is open', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');

      await user.click(menuButton);
      const closeIcon = menuButton.querySelector('svg');
      expect(closeIcon).toBeInTheDocument();
    });

    it('should render mobile navigation links', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');

      await user.click(menuButton);

      // For unauthenticated users
      expect(screen.getByTestId('mobile-nav-link-/catalog')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-nav-link-/')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-nav-link-/login')).toBeInTheDocument();
    });

    it('should close mobile menu when link is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');
      const mobileMenu = screen.getByTestId('mobile-menu');

      // Open menu
      await user.click(menuButton);
      expect(mobileMenu).toHaveClass('max-h-96');

      // Click a link
      const homeLink = screen.getByTestId('mobile-nav-link-/');
      await user.click(homeLink);

      // Menu should be closed
      expect(mobileMenu).toHaveClass('max-h-0');
    });

    it('should highlight active page in mobile menu', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 'u-1', name: 'Test User', role: 'student' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        signupWithGoogle: vi.fn(),
        logout: vi.fn(),
      } as AuthContextType);
      
      renderWithRouter({}, ['/dashboard']);
      const menuButton = screen.getByTestId('mobile-menu-button');

      await user.click(menuButton);

      const dashboardLink = screen.getByTestId('mobile-nav-link-/dashboard');
      expect(dashboardLink).toHaveClass('bg-planet-green-dark');
      expect(dashboardLink).toHaveClass('text-white');
    });
  });

  describe('Styling and Theme', () => {
    it('should have green/earthy theme colors', () => {
      renderWithRouter();
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveClass('bg-white');
      expect(navbar).toHaveClass('border-green-100');
    });

    it('should have hover styles on links', () => {
      renderWithRouter();
      const coursesLink = screen.getByTestId('nav-link-/catalog');
      expect(coursesLink).toHaveClass('hover:text-planet-green-dark');
      expect(coursesLink).toHaveClass('hover:bg-green-50');
    });

    it('should have transition animations', () => {
      renderWithRouter();
      const coursesLink = screen.getByTestId('nav-link-/catalog');
      expect(coursesLink).toHaveClass('transition-all');
      expect(coursesLink).toHaveClass('duration-200');
    });

    it('should have shadow on navbar', () => {
      renderWithRouter();
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveClass('shadow-md');
    });

    it('should be sticky', () => {
      renderWithRouter();
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toHaveClass('sticky');
      expect(navbar).toHaveClass('top-0');
      expect(navbar).toHaveClass('z-50');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on mobile menu button', () => {
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle mobile menu');
    });

    it('should have aria-expanded on mobile menu button', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');

      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-current on active link', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'u-1', name: 'Test User', role: 'student' },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        signup: vi.fn(),
        loginWithGoogle: vi.fn(),
        signupWithGoogle: vi.fn(),
        logout: vi.fn(),
      } as AuthContextType);
      
      renderWithRouter({}, ['/']);
      const homeLink = screen.getByTestId('nav-link-/');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have focus styles on mobile menu button', () => {
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');
      expect(menuButton).toHaveClass('focus:outline-none');
      expect(menuButton).toHaveClass('focus:ring-2');
      expect(menuButton).toHaveClass('focus:ring-green-500');
    });
  });

  describe('Responsive Design', () => {
    it('should hide desktop navigation on mobile', () => {
      renderWithRouter();
      const desktopNav = screen.getByTestId('nav-link-/catalog').closest('.hidden');
      expect(desktopNav).toHaveClass('md:flex');
    });

    it('should show mobile menu button on mobile', () => {
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');
      expect(menuButton).toHaveClass('md:hidden');
    });

    it('should hide mobile menu on desktop', () => {
      renderWithRouter();
      const mobileMenu = screen.getByTestId('mobile-menu');
      expect(mobileMenu).toHaveClass('md:hidden');
    });
  });

  describe('Logo Link', () => {
    it('should link to home page', () => {
      renderWithRouter();
      const logo = screen.getByTestId('navbar-logo');
      expect(logo).toHaveAttribute('href', '/');
    });

    it('should close mobile menu when logo is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByTestId('mobile-menu-button');
      const mobileMenu = screen.getByTestId('mobile-menu');
      const logo = screen.getByTestId('navbar-logo');

      // Open menu
      await user.click(menuButton);
      expect(mobileMenu).toHaveClass('max-h-96');

      // Click logo
      await user.click(logo);

      // Menu should be closed
      expect(mobileMenu).toHaveClass('max-h-0');
    });

    it('should have hover effect on logo', () => {
      renderWithRouter();
      const logo = screen.getByTestId('navbar-logo');
      expect(logo).toHaveClass('hover:text-planet-green-dark/80');
      expect(logo).toHaveClass('transition-colors');
      expect(logo).toHaveClass('text-planet-green-dark');
    });
  });
});

