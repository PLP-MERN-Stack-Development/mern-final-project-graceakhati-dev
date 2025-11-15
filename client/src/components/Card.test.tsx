import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card, { CardProps } from './Card';

describe('Card Component', () => {
  const defaultProps: CardProps = {
    children: <div>Card Content</div>,
  };

  describe('Rendering', () => {
    it('should render card with children', () => {
      render(<Card {...defaultProps} />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should render card with multiple children', () => {
      render(
        <Card>
          <div>First Child</div>
          <div>Second Child</div>
        </Card>
      );
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Card {...defaultProps} className="custom-class" />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });

    it('should merge className with base styles', () => {
      render(<Card {...defaultProps} className="p-4" />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('p-4');
    });
  });

  describe('Styling', () => {
    it('should have base green/earthy theme styles', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border-2');
      expect(card).toHaveClass('border-green-100');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should have transition classes', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-300');
    });

    it('should have hover styles when not clickable', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:shadow-md');
    });
  });

  describe('Clickable Card', () => {
    it('should have clickable styles when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('hover:border-green-300');
      expect(card).toHaveClass('hover:scale-[1.02]');
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('active:scale-[0.98]');
    });

    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      const card = screen.getByTestId('card');
      
      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have button role when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('should be keyboard accessible when clickable', () => {
      const handleClick = vi.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should call onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      const card = screen.getByTestId('card');
      
      card.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      const card = screen.getByTestId('card');
      
      card.focus();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not have button role when onClick is not provided', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveAttribute('role', 'button');
    });

    it('should not be keyboard accessible when not clickable', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper test id', () => {
      render(<Card {...defaultProps} />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should be accessible via keyboard when clickable', () => {
      const handleClick = vi.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className', () => {
      render(<Card {...defaultProps} className="" />);
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('should handle className with extra spaces', () => {
      render(<Card {...defaultProps} className="  p-4  m-2  " />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-4');
      expect(card).toHaveClass('m-2');
    });

    it('should handle null children', () => {
      render(<Card>{null}</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(<Card>{undefined}</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have scale animation on hover when clickable', () => {
      const handleClick = vi.fn();
      render(<Card {...defaultProps} onClick={handleClick} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:scale-[1.02]');
      expect(card).toHaveClass('active:scale-[0.98]');
    });

    it('should not have scale animation when not clickable', () => {
      render(<Card {...defaultProps} />);
      const card = screen.getByTestId('card');
      expect(card).not.toHaveClass('hover:scale-[1.02]');
      expect(card).not.toHaveClass('active:scale-[0.98]');
    });
  });
});

