import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './emptystate';

describe('EmptyState Component', () => {
  describe('Rendering', () => {
    it('should render courses empty state', () => {
      render(<EmptyState type="courses" />);
      expect(screen.getByTestId('empty-state-courses')).toBeInTheDocument();
      expect(screen.getByText('No Courses Yet')).toBeInTheDocument();
    });

    it('should render projects empty state', () => {
      render(<EmptyState type="projects" />);
      expect(screen.getByTestId('empty-state-projects')).toBeInTheDocument();
      expect(screen.getByText('No Projects Found')).toBeInTheDocument();
    });

    it('should render progress empty state', () => {
      render(<EmptyState type="progress" />);
      expect(screen.getByTestId('empty-state-progress')).toBeInTheDocument();
      expect(screen.getByText('No Progress Yet')).toBeInTheDocument();
    });

    it('should render notifications empty state', () => {
      render(<EmptyState type="notifications" />);
      expect(screen.getByTestId('empty-state-notifications')).toBeInTheDocument();
      expect(screen.getByText('No Notifications')).toBeInTheDocument();
    });
  });

  describe('Custom Content', () => {
    it('should use custom title when provided', () => {
      render(<EmptyState type="courses" title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.queryByText('No Courses Yet')).not.toBeInTheDocument();
    });

    it('should use custom message when provided', () => {
      const customMessage = 'This is a custom message';
      render(<EmptyState type="courses" message={customMessage} />);
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render action button when onAction and actionLabel are provided', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          type="courses"
          actionLabel="Browse Courses"
          onAction={handleAction}
        />
      );
      const button = screen.getByText('Browse Courses');
      expect(button).toBeInTheDocument();
    });

    it('should not render action button when onAction is not provided', () => {
      render(<EmptyState type="courses" actionLabel="Browse Courses" />);
      expect(screen.queryByText('Browse Courses')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onAction when button is clicked', async () => {
      const user = userEvent.setup();
      const handleAction = vi.fn();
      render(
        <EmptyState
          type="courses"
          actionLabel="Browse Courses"
          onAction={handleAction}
        />
      );
      const button = screen.getByText('Browse Courses');
      await user.click(button);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Image Loading', () => {
    it('should load correct image for courses type', () => {
      render(<EmptyState type="courses" />);
      const image = screen.getByAltText('No Courses Yet');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/assets/illustrations/empty-courses.png');
    });

    it('should load correct image for projects type', () => {
      render(<EmptyState type="projects" />);
      const image = screen.getByAltText('No Projects Found');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/assets/illustrations/empty-projects.png');
    });

    it('should load correct image for progress type', () => {
      render(<EmptyState type="progress" />);
      const image = screen.getByAltText('No Progress Yet');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/assets/illustrations/empty-progress.png');
    });

    it('should load correct image for notifications type', () => {
      render(<EmptyState type="notifications" />);
      const image = screen.getByAltText('No Notifications');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/assets/illustrations/empty-notifications.png');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <EmptyState type="courses" className="custom-class" />
      );
      const emptyState = container.querySelector('[data-testid="empty-state-courses"]');
      expect(emptyState).toHaveClass('custom-class');
    });
  });
});

