import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ErrorPage from './errorpage';

// Helper to render with router
const renderWithRouter = (props = {}) => {
  return render(
    <BrowserRouter>
      <ErrorPage {...props} />
    </BrowserRouter>
  );
};

describe('ErrorPage Component', () => {
  describe('Rendering', () => {
    it('should render 404 error page', () => {
      renderWithRouter({ type: '404' });
      expect(screen.getByTestId('error-page-404')).toBeInTheDocument();
      expect(screen.getByText('Oops! Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should render offline error page', () => {
      renderWithRouter({ type: 'offline' });
      expect(screen.getByTestId('error-page-offline')).toBeInTheDocument();
      expect(screen.getByText("You're Offline")).toBeInTheDocument();
    });

    it('should render generic error page by default', () => {
      renderWithRouter();
      expect(screen.getByTestId('error-page-generic')).toBeInTheDocument();
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });
  });

  describe('Custom Content', () => {
    it('should use custom title when provided', () => {
      renderWithRouter({ type: '404', title: 'Custom Error Title' });
      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
      expect(screen.queryByText('Oops! Page Not Found')).not.toBeInTheDocument();
    });

    it('should use custom message when provided', () => {
      const customMessage = 'This is a custom error message';
      renderWithRouter({ type: '404', message: customMessage });
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render Go Home button by default', () => {
      renderWithRouter({ type: '404' });
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('should render Go Back button', () => {
      renderWithRouter({ type: '404' });
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('should hide Go Home button when showHomeButton is false', () => {
      renderWithRouter({ type: '404', showHomeButton: false });
      expect(screen.queryByText('Go Home')).not.toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('should have correct link for Go Home button', () => {
      renderWithRouter({ type: '404' });
      const homeLink = screen.getByText('Go Home').closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Image Loading', () => {
    it('should load correct image for 404 error', () => {
      renderWithRouter({ type: '404' });
      const image = screen.getByAltText('Oops! Page Not Found');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/assets/illustrations/error-404-earth.png');
    });

    it('should load correct image for offline error', () => {
      renderWithRouter({ type: 'offline' });
      const image = screen.getByAltText("You're Offline");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/assets/illustrations/error-offline-plant.png');
    });

    it('should load correct image for generic error', () => {
      renderWithRouter({ type: 'generic' });
      const image = screen.getByAltText('Something Went Wrong');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/assets/illustrations/error-offline-plant.png');
    });
  });

  describe('Interactions', () => {
    it('should call window.history.back when Go Back is clicked', async () => {
      const backSpy = vi.spyOn(window.history, 'back');
      renderWithRouter({ type: '404' });
      const goBackButton = screen.getByText('Go Back');
      await goBackButton.click();
      expect(backSpy).toHaveBeenCalled();
      backSpy.mockRestore();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = renderWithRouter({
        type: '404',
        className: 'custom-error-class',
      });
      const errorPage = container.querySelector('[data-testid="error-page-404"]');
      expect(errorPage).toHaveClass('custom-error-class');
    });
  });

  describe('Support Link', () => {
    it('should render contact support link', () => {
      renderWithRouter({ type: '404' });
      const supportLink = screen.getByText('Contact Support');
      expect(supportLink).toBeInTheDocument();
      expect(supportLink.closest('a')).toHaveAttribute('href', '/contact');
    });
  });
});

