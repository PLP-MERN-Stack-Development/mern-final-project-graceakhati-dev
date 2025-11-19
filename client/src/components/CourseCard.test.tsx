import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCard, { CourseCardProps } from './coursecard';

// Helper function to render component with router
const renderWithRouter = (props: CourseCardProps) => {
  return render(
    <BrowserRouter>
      <CourseCard {...props} />
    </BrowserRouter>
  );
};

describe('CourseCard Component', () => {
  const defaultProps: CourseCardProps = {
    id: '1',
    title: 'Introduction to Climate Science',
    description: 'Learn the fundamentals of climate change and its impacts.',
    image: 'https://example.com/image.jpg',
    level: 'Beginner',
    tags: ['Climate', 'Science', 'Environment'],
    price: 0,
  };

  describe('Rendering', () => {
    it('should render course card with all required props', () => {
      renderWithRouter(defaultProps);

      expect(screen.getByTestId('course-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('course-title')).toHaveTextContent(
        'Introduction to Climate Science'
      );
    });

    it('should render course title', () => {
      renderWithRouter(defaultProps);
      const title = screen.getByTestId('course-title');
      expect(title).toHaveTextContent('Introduction to Climate Science');
    });

    it('should render course description when provided', () => {
      renderWithRouter(defaultProps);
      const description = screen.getByTestId('course-description');
      expect(description).toHaveTextContent(
        'Learn the fundamentals of climate change and its impacts.'
      );
    });

    it('should not render description when not provided', () => {
      const propsWithoutDescription = { ...defaultProps };
      delete propsWithoutDescription.description;
      renderWithRouter(propsWithoutDescription);

      expect(screen.queryByTestId('course-description')).not.toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('should render course image when provided', () => {
      renderWithRouter(defaultProps);
      const imageContainer = screen.getByTestId('course-image');
      expect(imageContainer).toBeInTheDocument();
      const image = imageContainer.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Introduction to Climate Science');
    });

    it('should render placeholder when image is not provided', () => {
      const propsWithoutImage = { ...defaultProps };
      delete propsWithoutImage.image;
      renderWithRouter(propsWithoutImage);

      expect(screen.queryByTestId('course-image')).not.toBeInTheDocument();
      // Should show placeholder SVG icon
      const placeholder = screen.getByTestId('course-card-1').querySelector('svg');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('Level Badge', () => {
    it('should render Beginner level badge with correct styling', () => {
      renderWithRouter({ ...defaultProps, level: 'Beginner' });
      const badge = screen.getByTestId('level-badge');
      expect(badge).toHaveTextContent('Beginner');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should render Intermediate level badge with correct styling', () => {
      renderWithRouter({ ...defaultProps, level: 'Intermediate' });
      const badge = screen.getByTestId('level-badge');
      expect(badge).toHaveTextContent('Intermediate');
      expect(badge).toHaveClass('bg-amber-100', 'text-amber-800');
    });

    it('should render Advanced level badge with correct styling', () => {
      renderWithRouter({ ...defaultProps, level: 'Advanced' });
      const badge = screen.getByTestId('level-badge');
      expect(badge).toHaveTextContent('Advanced');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
    });

    it('should default to Beginner when level is not provided', () => {
      const propsWithoutLevel = { ...defaultProps };
      delete propsWithoutLevel.level;
      renderWithRouter(propsWithoutLevel);

      const badge = screen.getByTestId('level-badge');
      expect(badge).toHaveTextContent('Beginner');
    });
  });

  describe('Price Badge', () => {
    it('should render "Free" when price is 0', () => {
      renderWithRouter({ ...defaultProps, price: 0 });
      const priceBadge = screen.getByTestId('price-badge');
      expect(priceBadge).toHaveTextContent('Free');
    });

    it('should render formatted price when price is provided', () => {
      renderWithRouter({ ...defaultProps, price: 5000 });
      const priceBadge = screen.getByTestId('price-badge');
      expect(priceBadge).toHaveTextContent('KES 5,000');
    });

    it('should not render price badge when price is undefined', () => {
      const propsWithoutPrice = { ...defaultProps };
      delete propsWithoutPrice.price;
      renderWithRouter(propsWithoutPrice);

      expect(screen.queryByTestId('price-badge')).not.toBeInTheDocument();
    });

    it('should format large prices correctly', () => {
      renderWithRouter({ ...defaultProps, price: 15000 });
      const priceBadge = screen.getByTestId('price-badge');
      expect(priceBadge).toHaveTextContent('KES 15,000');
    });
  });

  describe('Tags', () => {
    it('should render all tags when 3 or fewer tags provided', () => {
      renderWithRouter({
        ...defaultProps,
        tags: ['Climate', 'Science', 'Environment'],
      });

      const tagsContainer = screen.getByTestId('course-tags');
      expect(tagsContainer).toBeInTheDocument();
      expect(screen.getByText('Climate')).toBeInTheDocument();
      expect(screen.getByText('Science')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
    });

    it('should render only first 3 tags and show count for remaining', () => {
      renderWithRouter({
        ...defaultProps,
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'],
      });

      expect(screen.getByText('Tag1')).toBeInTheDocument();
      expect(screen.getByText('Tag2')).toBeInTheDocument();
      expect(screen.getByText('Tag3')).toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('should not render tags section when tags array is empty', () => {
      renderWithRouter({ ...defaultProps, tags: [] });
      expect(screen.queryByTestId('course-tags')).not.toBeInTheDocument();
    });

    it('should not render tags section when tags are not provided', () => {
      const propsWithoutTags = { ...defaultProps };
      delete propsWithoutTags.tags;
      renderWithRouter(propsWithoutTags);

      expect(screen.queryByTestId('course-tags')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should link to correct course route', () => {
      renderWithRouter(defaultProps);
      const link = screen.getByTestId('course-card-1').closest('a');
      expect(link).toHaveAttribute('href', '/courses/1');
    });

    it('should link to correct course route with different id', () => {
      renderWithRouter({ ...defaultProps, id: '42' });
      const link = screen.getByTestId('course-card-42').closest('a');
      expect(link).toHaveAttribute('href', '/courses/42');
    });
  });

  describe('Enroll Button Context', () => {
    it('should render title and description for enroll button context', () => {
      renderWithRouter(defaultProps);
      
      // Verify title is rendered (required for enroll button context)
      const title = screen.getByTestId('course-title');
      expect(title).toHaveTextContent('Introduction to Climate Science');
      
      // Verify description is rendered (required for enroll button context)
      const description = screen.getByTestId('course-description');
      expect(description).toHaveTextContent('Learn the fundamentals of climate change and its impacts.');
      
      // Note: Enroll button is typically rendered in a wrapper component (e.g., EnrollableCourseCard)
      // CourseCard itself is a Link component, so enroll functionality is handled by parent components
    });

    it('should render all required elements for enrollment flow', () => {
      renderWithRouter(defaultProps);
      
      // All elements needed for enrollment context
      expect(screen.getByTestId('course-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('course-title')).toBeInTheDocument();
      expect(screen.getByTestId('course-description')).toBeInTheDocument();
      
      // Card should be clickable (Link component)
      const link = screen.getByTestId('course-card-1').closest('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      renderWithRouter(defaultProps);
      const imageContainer = screen.getByTestId('course-image');
      const image = imageContainer.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Introduction to Climate Science');
    });

    it('should be keyboard navigable', () => {
      renderWithRouter(defaultProps);
      const link = screen.getByTestId('course-card-1').closest('a');
      expect(link).toBeInTheDocument();
    });
  });

  describe('Styling Classes', () => {
    it('should have hover animation classes', () => {
      renderWithRouter(defaultProps);
      const card = screen.getByTestId('course-card-1').firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-xl');
      expect(card).toHaveClass('hover:-translate-y-1');
      expect(card).toHaveClass('transition-all');
    });

    it('should have green/earthy theme classes', () => {
      renderWithRouter(defaultProps);
      const card = screen.getByTestId('course-card-1').firstChild as HTMLElement;
      expect(card).toHaveClass('border-green-100');
      expect(card).toHaveClass('hover:border-green-300');
    });
  });
});

