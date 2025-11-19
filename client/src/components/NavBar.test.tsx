import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import NavBar from './navbar';
import { useAuthStore } from '@/store/useAuthStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useAuthStore - Zustand store
let mockStoreState: any = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  role: null,
  logout: vi.fn(),
};

vi.mock('@/store/useAuthStore', () => {
  return {
    useAuthStore: vi.fn((selector?: any) => {
      if (typeof selector === 'function') {
        return selector(mockStoreState);
      }
      return mockStoreState;
    }),
  };
});

// Mock ImageLoader component
vi.mock('./imageloader', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} data-testid="image-loader" />
  ),
}));

// Mock ProtectedLink component
vi.mock('./auth/protectedlink', () => ({
  default: ({ to, children, className, 'data-testid': testId }: any) => (
    <a href={to} className={className} data-testid={testId}>
      {children}
    </a>
  ),
}));

// Mock imagePaths
vi.mock('@/utils/imagePaths', () => ({
  navIcons: {
    leaf: '/icons/leaf.svg',
    courses: '/icons/courses.svg',
    home: '/icons/home.svg',
    dashboard: '/icons/dashboard.svg',
    settings: '/icons/settings.svg',
  },
  dashboardAvatars: {
    default: '/avatars/default.png',
  },
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('NavBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset mock store state
    mockStoreState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
      logout: vi.fn(),
    };
    mockUseAuthStore.mockReturnValue(mockStoreState as any);
  });

  const renderWithRouter = (component: React.ReactElement, initialEntries: string[] = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('should render navbar with logo', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('navbar-logo')).toBeInTheDocument();
    });

    it('should render logo image', () => {
      renderWithRouter(<NavBar />);
      const logoImage = screen.getByAltText('Planet Path Logo');
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute('src', '/icons/leaf.svg');
    });

    it('should render Planet Path text in logo', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByText('Planet Path')).toBeInTheDocument();
    });

    it('should render mobile menu button', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should show login link when not authenticated', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('nav-link-/login')).toBeInTheDocument();
    });

    it('should show courses link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('nav-link-/courses')).toBeInTheDocument();
    });

    it('should show about link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
    });

    it('should not show user menu when not authenticated', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByTestId('user-menu-button')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    beforeEach(() => {
      mockStoreState = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
        logout: vi.fn(),
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);
    });

    it('should show user menu when authenticated', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('user-menu-button')).toBeInTheDocument();
    });

    it('should show user name when authenticated', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should show user avatar when authenticated', () => {
      renderWithRouter(<NavBar />);
      const avatar = screen.getByAltText('Test User avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', '/avatars/default.png');
    });

    it('should show home link when authenticated', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('nav-link-/')).toBeInTheDocument();
    });

    it('should show courses link when authenticated', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('nav-link-/courses')).toBeInTheDocument();
    });

    it('should not show login link when authenticated', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByTestId('nav-link-/login')).not.toBeInTheDocument();
    });
  });

  describe('Student Role', () => {
    beforeEach(() => {
      mockStoreState = {
        user: {
          id: 'student-123',
          name: 'Student User',
          email: 'student@example.com',
          role: 'student',
        },
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
        logout: vi.fn(),
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);
    });

    it('should show student dashboard link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('nav-link-/student/dashboard')).toBeInTheDocument();
    });

    it('should not show instructor link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByTestId('nav-link-/instructor')).not.toBeInTheDocument();
    });

    it('should not show admin link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByTestId('nav-link-/admin')).not.toBeInTheDocument();
    });
  });

  describe('Instructor Role', () => {
    beforeEach(() => {
      mockStoreState = {
        user: {
          id: 'instructor-123',
          name: 'Instructor User',
          email: 'instructor@example.com',
          role: 'instructor',
        },
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        role: 'instructor',
        logout: vi.fn(),
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);
    });

    it('should show instructor dashboard link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('nav-link-/instructor')).toBeInTheDocument();
    });

    it('should not show student dashboard link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByTestId('nav-link-/student/dashboard')).not.toBeInTheDocument();
    });

    it('should not show admin link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByTestId('nav-link-/admin')).not.toBeInTheDocument();
    });
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      mockStoreState = {
        user: {
          id: 'admin-123',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        role: 'admin',
        logout: vi.fn(),
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);
    });

    it('should show admin dashboard link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.getByTestId('nav-link-/admin')).toBeInTheDocument();
    });

    it('should not show student dashboard link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByTestId('nav-link-/student/dashboard')).not.toBeInTheDocument();
    });

    it('should not show instructor link', () => {
      renderWithRouter(<NavBar />);
      expect(screen.queryByTestId('nav-link-/instructor')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should toggle mobile menu when button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      
      renderWithRouter(<NavBar />);
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      
      expect(screen.getByTestId('mobile-menu')).toHaveClass('max-h-0');
      
      await user.click(mobileMenuButton);
      
      expect(screen.getByTestId('mobile-menu')).toHaveClass('max-h-96');
    });

    it('should show mobile nav links when menu is open', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      
      renderWithRouter(<NavBar />);
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      
      await user.click(mobileMenuButton);
      
      expect(screen.getByTestId('mobile-nav-link-/courses')).toBeInTheDocument();
    });
  });

  describe('Active Link Styling', () => {
    it('should apply active styles to current page link', () => {
      renderWithRouter(<NavBar />, ['/courses']);
      const coursesLink = screen.getByTestId('nav-link-/courses');
      expect(coursesLink).toHaveClass('bg-planet-green-dark');
      expect(coursesLink).toHaveClass('text-white');
    });

    it('should not apply active styles to non-current page links', () => {
      renderWithRouter(<NavBar />, ['/']);
      const coursesLink = screen.getByTestId('nav-link-/courses');
      expect(coursesLink).not.toHaveClass('bg-planet-green-dark');
      expect(coursesLink).not.toHaveClass('text-white');
    });
  });

  describe('User Dropdown', () => {
    beforeEach(() => {
      mockStoreState = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
        logout: vi.fn(),
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);
    });

    it('should show dropdown menu when user menu button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      
      renderWithRouter(<NavBar />);
      const userMenuButton = screen.getByTestId('user-menu-button');
      
      await user.click(userMenuButton);
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should show profile link in dropdown', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      
      renderWithRouter(<NavBar />);
      const userMenuButton = screen.getByTestId('user-menu-button');
      
      await user.click(userMenuButton);
      
      const profileLink = screen.getByText('Profile');
      expect(profileLink).toBeInTheDocument();
      expect(profileLink.closest('a')).toHaveAttribute('href', '/profile');
    });

    it('should call logout when logout button is clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      
      renderWithRouter(<NavBar />);
      const userMenuButton = screen.getByTestId('user-menu-button');
      
      await user.click(userMenuButton);
      
      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);
      
      expect(mockStoreState.logout).toHaveBeenCalled();
    });
  });

  describe('Mobile Navigation Links', () => {
    beforeEach(() => {
      mockStoreState = {
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
        },
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        role: 'student',
        logout: vi.fn(),
      };
      mockUseAuthStore.mockReturnValue(mockStoreState as any);
    });

    it('should show profile link in mobile menu when authenticated', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      
      renderWithRouter(<NavBar />);
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      
      await user.click(mobileMenuButton);
      
      expect(screen.getByTestId('mobile-nav-link-profile')).toBeInTheDocument();
    });

    it('should show logout link in mobile menu when authenticated', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      
      renderWithRouter(<NavBar />);
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      
      await user.click(mobileMenuButton);
      
      expect(screen.getByTestId('mobile-nav-link-logout')).toBeInTheDocument();
    });
  });
});
