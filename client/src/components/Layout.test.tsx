import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Layout, { LayoutProps } from './layout/layout';
import { useAuth } from '@/hooks/useAuth';
import type { AuthContextType } from '@/context/AuthContext';

// Mock Footer component
// layout.tsx is at components/layout/layout.tsx and imports './footer'
// So footer is at components/layout/footer.tsx
// Test is at components/layout.test.tsx, so we mock './layout/footer'
vi.mock('./layout/footer', () => {
  const Footer = () => <footer data-testid="footer">Footer</footer>;
  return { default: Footer };
});

// Mock NavBar component
vi.mock('../navbar', () => ({
  default: ({ currentPage }: { currentPage?: string }) => (
    <nav data-testid="navbar">NavBar {currentPage}</nav>
  ),
}));

// Mock the useAuth hook
vi.mock('@/hooks/useAuth');
const mockUseAuth = vi.mocked(useAuth);

// Helper function to render component with router
const renderWithRouter = (props: LayoutProps) => {
  return render(
    <BrowserRouter>
      <Layout {...props} />
    </BrowserRouter>
  );
};

describe('Layout Component', () => {
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
    it('should render layout with children', () => {
      renderWithRouter({ children: <div>Test Content</div> });
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render NavBar', () => {
      renderWithRouter({ children: <div>Content</div> });
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('should render Footer', () => {
      renderWithRouter({ children: <div>Content</div> });
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render main content area', () => {
      renderWithRouter({ children: <div>Main Content</div> });
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  describe('Page Title', () => {
    it('should render page title when provided', () => {
      renderWithRouter({
        children: <div>Content</div>,
        pageTitle: 'Dashboard',
      });
      const pageTitle = screen.getByTestId('page-title');
      expect(pageTitle).toBeInTheDocument();
      expect(pageTitle).toHaveTextContent('Dashboard');
    });

    it('should not render page title when not provided', () => {
      renderWithRouter({ children: <div>Content</div> });
      expect(screen.queryByTestId('page-title')).not.toBeInTheDocument();
    });

    it('should render different page titles', () => {
      renderWithRouter({
        children: <div>Content</div>,
        pageTitle: 'Courses',
      });
      const pageTitle = screen.getByTestId('page-title');
      expect(pageTitle).toHaveTextContent('Courses');
    });

    it('should have correct styling for page title', () => {
      renderWithRouter({
        children: <div>Content</div>,
        pageTitle: 'Test Title',
      });
      const pageTitle = screen.getByTestId('page-title');
      expect(pageTitle).toHaveClass('text-3xl');
      expect(pageTitle).toHaveClass('md:text-4xl');
      expect(pageTitle).toHaveClass('font-bold');
      expect(pageTitle).toHaveClass('text-planet-green-dark');
    });
  });

  describe('Current Page Prop', () => {
    it('should pass currentPage to NavBar', () => {
      renderWithRouter({
        children: <div>Content</div>,
        currentPage: 'dashboard',
      });
      // NavBar should receive currentPage prop
      const navbar = screen.getByTestId('navbar');
      expect(navbar).toBeInTheDocument();
    });

    it('should work without currentPage prop', () => {
      renderWithRouter({ children: <div>Content</div> });
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have green/earthy theme background', () => {
      renderWithRouter({ children: <div>Content</div> });
      const layout = screen.getByText('Content').closest('.min-h-screen');
      expect(layout).toHaveClass('bg-gradient-to-b');
      expect(layout).toHaveClass('from-green-50');
      expect(layout).toHaveClass('to-white');
    });

    it('should have flex layout', () => {
      renderWithRouter({ children: <div>Content</div> });
      const layout = screen.getByText('Content').closest('.min-h-screen');
      expect(layout).toHaveClass('flex');
      expect(layout).toHaveClass('flex-col');
    });

    it('should have responsive container', () => {
      renderWithRouter({ children: <div>Content</div> });
      const main = screen.getByText('Content').closest('main');
      expect(main).toHaveClass('container');
      expect(main).toHaveClass('mx-auto');
      expect(main).toHaveClass('px-4');
    });

    it('should have transition animations', () => {
      renderWithRouter({
        children: <div>Content</div>,
        pageTitle: 'Test',
      });
      const pageTitle = screen.getByTestId('page-title');
      expect(pageTitle).toHaveClass('transition-opacity');
      expect(pageTitle).toHaveClass('duration-300');
    });
  });

  describe('Structure', () => {
    it('should have NavBar at top', () => {
      renderWithRouter({ children: <div>Content</div> });
      const navbar = screen.getByTestId('navbar');
      const layout = navbar.closest('.min-h-screen');
      expect(layout).toBeInTheDocument();
      // NavBar should be first child
      expect(navbar).toBeInTheDocument();
    });

    it('should have Footer at bottom', () => {
      renderWithRouter({ children: <div>Content</div> });
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should have main content in between', () => {
      renderWithRouter({ children: <div>Main Content</div> });
      const main = screen.getByText('Main Content').closest('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('flex-grow');
    });
  });

  describe('Mobile Responsive', () => {
    it('should have responsive padding', () => {
      renderWithRouter({ children: <div>Content</div> });
      const main = screen.getByText('Content').closest('main');
      expect(main).toHaveClass('py-8');
      expect(main).toHaveClass('px-4');
    });

    it('should have responsive page title sizing', () => {
      renderWithRouter({
        children: <div>Content</div>,
        pageTitle: 'Test',
      });
      const pageTitle = screen.getByTestId('page-title');
      expect(pageTitle).toHaveClass('text-3xl');
      expect(pageTitle).toHaveClass('md:text-4xl');
    });
  });

  describe('Multiple Children', () => {
    it('should render multiple children elements', () => {
      renderWithRouter({
        children: (
          <>
            <div>First Child</div>
            <div>Second Child</div>
            <div>Third Child</div>
          </>
        ),
      });
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });
  });
});
