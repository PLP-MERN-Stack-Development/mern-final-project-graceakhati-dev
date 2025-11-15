import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NavBar, { NavBarProps } from './NavBar';

// Helper function to render component with router
const renderWithRouter = (props: NavBarProps = {}) => {
  return render(
    <BrowserRouter>
      <NavBar {...props} />
    </BrowserRouter>
  );
};

describe('NavBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should render all navigation links', () => {
      renderWithRouter();
      expect(screen.getByTestId('nav-link-home')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-projects')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-badges')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-certificates')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-settings')).toBeInTheDocument();
    });

    it('should render mobile menu button', () => {
      renderWithRouter();
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render Home link with correct path', () => {
      renderWithRouter();
      const homeLink = screen.getByTestId('nav-link-home');
      expect(homeLink).toHaveAttribute('href', '/');
      expect(homeLink).toHaveTextContent('Home');
    });

    it('should render Courses link with correct path', () => {
      renderWithRouter();
      const coursesLink = screen.getByTestId('nav-link-courses');
      expect(coursesLink).toHaveAttribute('href', '/catalog');
      expect(coursesLink).toHaveTextContent('Courses');
    });

    it('should render Dashboard link with correct path', () => {
      renderWithRouter();
      const dashboardLink = screen.getByTestId('nav-link-dashboard');
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(dashboardLink).toHaveTextContent('Dashboard');
    });

    it('should render Projects link with correct path', () => {
      renderWithRouter();
      const projectsLink = screen.getByTestId('nav-link-projects');
      expect(projectsLink).toHaveAttribute('href', '/projects');
      expect(projectsLink).toHaveTextContent('Projects');
    });

    it('should render Badges link with correct path', () => {
      renderWithRouter();
      const badgesLink = screen.getByTestId('nav-link-badges');
      expect(badgesLink).toHaveAttribute('href', '/badges');
      expect(badgesLink).toHaveTextContent('Badges');
    });

    it('should render Certificates link with correct path', () => {
      renderWithRouter();
      const certificatesLink = screen.getByTestId('nav-link-certificates');
      expect(certificatesLink).toHaveAttribute('href', '/certificates');
      expect(certificatesLink).toHaveTextContent('Certificates');
    });

    it('should render Settings link with correct path', () => {
      renderWithRouter();
      const settingsLink = screen.getByTestId('nav-link-settings');
      expect(settingsLink).toHaveAttribute('href', '/settings');
      expect(settingsLink).toHaveTextContent('Settings');
    });

    it('should render icons for all navigation links', () => {
      renderWithRouter();
      const homeLink = screen.getByTestId('nav-link-home');
      const coursesLink = screen.getByTestId('nav-link-courses');
      const dashboardLink = screen.getByTestId('nav-link-dashboard');
      
      // Check that icons are present (ImageLoader components render img tags)
      expect(homeLink.querySelector('img')).toBeInTheDocument();
      expect(coursesLink.querySelector('img')).toBeInTheDocument();
      expect(dashboardLink.querySelector('img')).toBeInTheDocument();
    });
  });

  describe('Active Page Highlighting', () => {
    it('should highlight home page when currentPage is home', () => {
      renderWithRouter({ currentPage: 'home' });
      const homeLink = screen.getByTestId('nav-link-home');
      expect(homeLink).toHaveClass('bg-planet-green-dark');
      expect(homeLink).toHaveClass('text-white');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight courses page when currentPage is courses', () => {
      renderWithRouter({ currentPage: 'courses' });
      const coursesLink = screen.getByTestId('nav-link-courses');
      expect(coursesLink).toHaveClass('bg-planet-green-dark');
      expect(coursesLink).toHaveClass('text-white');
      expect(coursesLink).toHaveAttribute('aria-current', 'page');
    });

    it('should highlight dashboard page when currentPage is dashboard', () => {
      renderWithRouter({ currentPage: 'dashboard' });
      const dashboardLink = screen.getByTestId('nav-link-dashboard');
      expect(dashboardLink).toHaveClass('bg-planet-green-dark');
      expect(dashboardLink).toHaveClass('text-white');
    });

    it('should not highlight inactive pages', () => {
      renderWithRouter({ currentPage: 'home' });
      const coursesLink = screen.getByTestId('nav-link-courses');
      expect(coursesLink).not.toHaveClass('bg-planet-green-dark');
      expect(coursesLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('should handle undefined currentPage', () => {
      renderWithRouter();
      const homeLink = screen.getByTestId('nav-link-home');
      expect(homeLink).not.toHaveClass('bg-planet-green-dark');
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

      expect(screen.getByTestId('mobile-nav-link-home')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-nav-link-courses')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-nav-link-dashboard')).toBeInTheDocument();
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
      const homeLink = screen.getByTestId('mobile-nav-link-home');
      await user.click(homeLink);

      // Menu should be closed
      expect(mobileMenu).toHaveClass('max-h-0');
    });

    it('should highlight active page in mobile menu', async () => {
      const user = userEvent.setup();
      renderWithRouter({ currentPage: 'dashboard' });
      const menuButton = screen.getByTestId('mobile-menu-button');

      await user.click(menuButton);

      const dashboardLink = screen.getByTestId('mobile-nav-link-dashboard');
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
      const homeLink = screen.getByTestId('nav-link-home');
      expect(homeLink).toHaveClass('hover:text-planet-green-dark');
      expect(homeLink).toHaveClass('hover:bg-green-50');
    });

    it('should have transition animations', () => {
      renderWithRouter();
      const homeLink = screen.getByTestId('nav-link-home');
      expect(homeLink).toHaveClass('transition-all');
      expect(homeLink).toHaveClass('duration-200');
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
      renderWithRouter({ currentPage: 'home' });
      const homeLink = screen.getByTestId('nav-link-home');
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
      const desktopNav = screen.getByTestId('nav-link-home').closest('.hidden');
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

