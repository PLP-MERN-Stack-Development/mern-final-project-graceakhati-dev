import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NavBar, { NavBarProps } from './navbar';
import { useAuthStore, UserRole } from '@/store/useAuthStore';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/', search: '', hash: '', state: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock useAuthStore
vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock ImageLoader to avoid image loading issues
vi.mock('@/components/ImageLoader', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} data-testid={`image-${alt}`} />
  ),
}));

// Mock imagePaths to avoid path resolution issues
vi.mock('@/utils/imagePaths', () => ({
  navIcons: {
    leaf: '/assets/icons/icon-leaf.svg',
    home: '/assets/icons/icon-home.svg',
    courses: '/assets/icons/icon-courses.svg',
    dashboard: '/assets/icons/icon-dashboard.svg',
    settings: '/assets/icons/icon-settings.svg',
  },
  dashboardAvatars: {
    default: '/assets/avatars/default.png',
  },
}));

// Helper function to render component with router
const renderWithRouter = (props: NavBarProps = {}, initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <NavBar {...props} />
    </MemoryRouter>
  );
};

// Helper to set up auth store mock
const setupAuthStore = (user: { id: string; name: string; role: UserRole } | null, token: string | null = null) => {
  const mockStore = {
    user,
    token,
    isAuthenticated: !!(user && token),
    isLoading: false,
    role: user?.role || null,
    logout: vi.fn(),
    setUser: vi.fn(),
    setToken: vi.fn(),
    setLoading: vi.fn(),
    setRole: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
    loginWithGoogle: vi.fn(),
    loginWithUser: vi.fn(),
    checkRole: vi.fn(),
  };
  
  (useAuthStore as any).mockReturnValue(mockStore);
  return mockStore;
};

// Helper to set up localStorage
const setupLocalStorage = (user: { id: string; name: string; role: UserRole } | null, token: string | null = null) => {
  if (user && token) {
    localStorage.setItem(
      'planet-path-auth-storage',
      JSON.stringify({
        user,
        token,
        isAuthenticated: true,
        role: user.role,
      })
    );
  } else {
    localStorage.removeItem('planet-path-auth-storage');
  }
};

describe('NavBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
    // Default: unauthenticated user
    setupAuthStore(null, null);
    setupLocalStorage(null, null);
    // Reset location mock
    mockLocation.pathname = '/';
  });

  afterEach(() => {
    localStorage.clear();
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
      expect(screen.getByTestId('nav-link-/courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/login')).toBeInTheDocument();
    });

    it('should not show avatar dropdown when not authenticated', () => {
      renderWithRouter();
      expect(screen.queryByTestId('user-menu-button')).not.toBeInTheDocument();
    });

    it('should not show Dashboard, Instructor, or Admin links when not authenticated', () => {
      renderWithRouter();
      expect(screen.queryByTestId('nav-link-/dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-/instructor')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-/admin')).not.toBeInTheDocument();
    });
  });

  describe('Student Navigation', () => {
    beforeEach(() => {
      const studentUser = { id: 'u-1', name: 'John Student', role: 'student' as UserRole };
      setupAuthStore(studentUser, 'token123');
      setupLocalStorage(studentUser, 'token123');
    });

    it('should show student navigation links', () => {
      renderWithRouter();
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/dashboard')).toBeInTheDocument();
    });

    it('should show avatar dropdown for student', () => {
      renderWithRouter();
      expect(screen.getByTestId('user-menu-button')).toBeInTheDocument();
    });

    it('should not show Instructor or Admin links for student', () => {
      renderWithRouter();
      expect(screen.queryByTestId('nav-link-/instructor')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-/admin')).not.toBeInTheDocument();
    });
  });

  describe('Instructor Navigation', () => {
    beforeEach(() => {
      const instructorUser = { id: 'u-2', name: 'Jane Instructor', role: 'instructor' as UserRole };
      setupAuthStore(instructorUser, 'token456');
      setupLocalStorage(instructorUser, 'token456');
    });

    it('should show instructor navigation links', () => {
      renderWithRouter();
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-/instructor')).toBeInTheDocument();
    });

    it('should not show Dashboard link for instructor', () => {
      renderWithRouter();
      expect(screen.queryByTestId('nav-link-/dashboard')).not.toBeInTheDocument();
    });

    it('should not show Admin links for instructor', () => {
      renderWithRouter();
      expect(screen.queryByTestId('nav-link-/admin')).not.toBeInTheDocument();
    });

    it('should show avatar dropdown for instructor', () => {
      renderWithRouter();
      expect(screen.getByTestId('user-menu-button')).toBeInTheDocument();
    });
  });

  describe('Admin Navigation', () => {
    beforeEach(() => {
      const adminUser = { id: 'u-3', name: 'Admin User', role: 'admin' as UserRole };
      setupAuthStore(adminUser, 'token789');
      setupLocalStorage(adminUser, 'token789');
    });

    it('should show admin navigation links', () => {
      renderWithRouter();
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
      const adminLinks = screen.getAllByTestId('nav-link-/admin');
      expect(adminLinks.length).toBeGreaterThan(0);
      expect(adminLinks[0]).toHaveAttribute('href', '/admin');
    });

    it('should not show Courses or Dashboard links for admin', () => {
      renderWithRouter();
      // Admin should see Courses link (it's in baseLinks), but not Dashboard
      expect(screen.getByTestId('nav-link-/courses')).toBeInTheDocument(); // Courses is in baseLinks
      expect(screen.queryByTestId('nav-link-/dashboard')).not.toBeInTheDocument();
    });

    it('should show avatar dropdown for admin', () => {
      renderWithRouter();
      expect(screen.getByTestId('user-menu-button')).toBeInTheDocument();
    });
  });

  describe('Active Link Highlighting', () => {
    beforeEach(() => {
      const studentUser = { id: 'u-1', name: 'Test User', role: 'student' as UserRole };
      setupAuthStore(studentUser, 'token');
      setupLocalStorage(studentUser, 'token');
    });

    it('should highlight active link based on current route', () => {
      mockLocation.pathname = '/dashboard';
      renderWithRouter({}, ['/dashboard']);
      const dashboardLink = screen.getByTestId('nav-link-/dashboard');
      expect(dashboardLink).toHaveClass('bg-planet-green-dark');
      expect(dashboardLink).toHaveClass('text-white');
    });

    it('should highlight Courses link when on /courses', () => {
      mockLocation.pathname = '/courses';
      renderWithRouter({}, ['/courses']);
      const coursesLink = screen.getByTestId('nav-link-/courses');
      expect(coursesLink).toHaveClass('bg-planet-green-dark');
    });

    it('should highlight Home link when on /', () => {
      mockLocation.pathname = '/';
      renderWithRouter({}, ['/']);
      const homeLink = screen.getByTestId('nav-link-/');
      expect(homeLink).toHaveClass('bg-planet-green-dark');
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
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('max-h-96');
      });

      // Click to close
      await user.click(menuButton);
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('max-h-0');
      });
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
      expect(screen.getByTestId('mobile-nav-link-/courses')).toBeInTheDocument();
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
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('max-h-96');
      });

      // Click a link
      const homeLink = screen.getByTestId('mobile-nav-link-/');
      await user.click(homeLink);

      // Menu should be closed
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('max-h-0');
      });
    });

    it('should highlight active page in mobile menu', async () => {
      const user = userEvent.setup();
      const studentUser = { id: 'u-1', name: 'Test User', role: 'student' as UserRole };
      setupAuthStore(studentUser, 'token');
      setupLocalStorage(studentUser, 'token');
      mockLocation.pathname = '/dashboard';
      
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
      const coursesLink = screen.getByTestId('nav-link-/courses');
      expect(coursesLink).toHaveClass('hover:text-planet-green-dark');
      expect(coursesLink).toHaveClass('hover:bg-green-50');
    });

    it('should have transition animations', () => {
      renderWithRouter();
      const coursesLink = screen.getByTestId('nav-link-/courses');
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
      await waitFor(() => {
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have aria-current on active link', () => {
      const studentUser = { id: 'u-1', name: 'Test User', role: 'student' as UserRole };
      setupAuthStore(studentUser, 'token');
      setupLocalStorage(studentUser, 'token');
      mockLocation.pathname = '/';
      
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
      // Desktop nav has class 'hidden md:flex'
      const desktopNav = screen.getByTestId('nav-link-/courses').closest('.hidden');
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
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('max-h-96');
      });

      // Click logo
      await user.click(logo);

      // Menu should be closed
      await waitFor(() => {
        expect(mobileMenu).toHaveClass('max-h-0');
      });
    });

    it('should have hover effect on logo', () => {
      renderWithRouter();
      const logo = screen.getByTestId('navbar-logo');
      expect(logo).toHaveClass('hover:text-planet-green-dark/80');
      expect(logo).toHaveClass('transition-colors');
      expect(logo).toHaveClass('text-planet-green-dark');
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout when logout button is clicked', async () => {
      const user = userEvent.setup();
      const studentUser = { id: 'u-1', name: 'Test User', role: 'student' as UserRole };
      const mockStore = setupAuthStore(studentUser, 'token');
      setupLocalStorage(studentUser, 'token');
      
      renderWithRouter();
      
      // Open dropdown
      const userMenuButton = screen.getByTestId('user-menu-button');
      await user.click(userMenuButton);
      
      // Click logout
      const logoutButton = screen.getByRole('menuitem', { name: /logout/i });
      await user.click(logoutButton);
      
      // Verify logout was called
      expect(mockStore.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
