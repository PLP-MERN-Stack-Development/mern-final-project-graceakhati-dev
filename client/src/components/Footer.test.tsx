import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

// Helper function to render component with router
const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer Component', () => {
  describe('Rendering', () => {
    it('should render footer', () => {
      renderWithRouter();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render copyright text', () => {
      renderWithRouter();
      expect(
        screen.getByText('© 2025 Planet Path. All rights reserved.')
      ).toBeInTheDocument();
    });

    it('should render all footer links', () => {
      renderWithRouter();
      expect(screen.getByTestId('footer-link-about')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-contact')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-privacy')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-terms')).toBeInTheDocument();
    });
  });

  describe('Footer Links', () => {
    it('should render About link with correct path', () => {
      renderWithRouter();
      const aboutLink = screen.getByTestId('footer-link-about');
      expect(aboutLink).toHaveAttribute('href', '/about');
      expect(aboutLink).toHaveTextContent('About');
    });

    it('should render Contact link with correct path', () => {
      renderWithRouter();
      const contactLink = screen.getByTestId('footer-link-contact');
      expect(contactLink).toHaveAttribute('href', '/contact');
      expect(contactLink).toHaveTextContent('Contact');
    });

    it('should render Privacy link with correct path', () => {
      renderWithRouter();
      const privacyLink = screen.getByTestId('footer-link-privacy');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
      expect(privacyLink).toHaveTextContent('Privacy');
    });

    it('should render Terms link with correct path', () => {
      renderWithRouter();
      const termsLink = screen.getByTestId('footer-link-terms');
      expect(termsLink).toHaveAttribute('href', '/terms');
      expect(termsLink).toHaveTextContent('Terms');
    });
  });

  describe('Styling and Theme', () => {
    it('should have green/earthy theme colors', () => {
      renderWithRouter();
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('bg-planet-brown-dark');
      expect(footer).toHaveClass('border-planet-green-dark');
    });

    it('should have white text color', () => {
      renderWithRouter();
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('text-white');
    });

    it('should have hover effects on links', () => {
      renderWithRouter();
      const aboutLink = screen.getByTestId('footer-link-about');
      expect(aboutLink).toHaveClass('hover:text-planet-green-light');
      expect(aboutLink).toHaveClass('transition-colors');
      expect(aboutLink).toHaveClass('duration-200');
      expect(aboutLink).toHaveClass('hover:underline');
    });

    it('should have light brown text on links', () => {
      renderWithRouter();
      const aboutLink = screen.getByTestId('footer-link-about');
      expect(aboutLink).toHaveClass('text-planet-brown-light');
    });

    it('should have border styling', () => {
      renderWithRouter();
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('border-t-2');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive flex layout', () => {
      renderWithRouter();
      const footer = screen.getByTestId('footer');
      const container = footer.querySelector('.flex');
      expect(container).toHaveClass('flex-col');
      expect(container).toHaveClass('md:flex-row');
    });

    it('should have responsive spacing', () => {
      renderWithRouter();
      const footer = screen.getByTestId('footer');
      const container = footer.querySelector('.flex');
      expect(container).toHaveClass('space-y-4');
      expect(container).toHaveClass('md:space-y-0');
    });

    it('should have responsive padding', () => {
      renderWithRouter();
      const footer = screen.getByTestId('footer');
      const innerContainer = footer.querySelector('.container');
      expect(innerContainer).toHaveClass('py-6');
      expect(innerContainer).toHaveClass('md:py-8');
    });

    it('should have responsive text alignment', () => {
      renderWithRouter();
      const copyright = screen
        .getByText('© 2025 Planet Path. All rights reserved.')
        .closest('div');
      expect(copyright).toHaveClass('text-center');
      expect(copyright).toHaveClass('md:text-left');
    });

    it('should have responsive text sizing', () => {
      renderWithRouter();
      const copyright = screen
        .getByText('© 2025 Planet Path. All rights reserved.')
        .closest('p');
      expect(copyright).toHaveClass('text-sm');
      expect(copyright).toHaveClass('md:text-base');
    });

    it('should have responsive link sizing', () => {
      renderWithRouter();
      const aboutLink = screen.getByTestId('footer-link-about');
      expect(aboutLink).toHaveClass('text-sm');
      expect(aboutLink).toHaveClass('md:text-base');
    });

    it('should have responsive link gap', () => {
      renderWithRouter();
      const nav = screen.getByTestId('footer-link-about').closest('nav');
      expect(nav).toHaveClass('gap-4');
      expect(nav).toHaveClass('md:gap-6');
    });

    it('should have responsive link alignment', () => {
      renderWithRouter();
      const nav = screen.getByTestId('footer-link-about').closest('nav');
      expect(nav).toHaveClass('justify-center');
      expect(nav).toHaveClass('md:justify-end');
    });
  });

  describe('Layout Structure', () => {
    it('should have container with padding', () => {
      renderWithRouter();
      const footer = screen.getByTestId('footer');
      const container = footer.querySelector('.container');
      expect(container).toHaveClass('mx-auto');
      expect(container).toHaveClass('px-4');
    });

    it('should have mt-auto for spacing', () => {
      renderWithRouter();
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('mt-auto');
    });

    it('should have flex-wrap for links', () => {
      renderWithRouter();
      const nav = screen.getByTestId('footer-link-about').closest('nav');
      expect(nav).toHaveClass('flex-wrap');
    });
  });

  describe('Accessibility', () => {
    it('should have proper test id', () => {
      renderWithRouter();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should have test ids for all links', () => {
      renderWithRouter();
      expect(screen.getByTestId('footer-link-about')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-contact')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-privacy')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-terms')).toBeInTheDocument();
    });

    it('should have underline offset on hover', () => {
      renderWithRouter();
      const aboutLink = screen.getByTestId('footer-link-about');
      expect(aboutLink).toHaveClass('underline-offset-4');
    });
  });

  describe('Copyright Text', () => {
    it('should have correct copyright year', () => {
      renderWithRouter();
      expect(
        screen.getByText('© 2025 Planet Path. All rights reserved.')
      ).toBeInTheDocument();
    });

    it('should have correct styling for copyright', () => {
      renderWithRouter();
      const copyright = screen
        .getByText('© 2025 Planet Path. All rights reserved.')
        .closest('p');
      expect(copyright).toHaveClass('text-planet-brown-light');
    });
  });
});

