import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button, { ButtonProps } from './button';

describe('Button Component', () => {
  const defaultProps: ButtonProps = {
    text: 'Click Me',
    onClick: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should render button with different text', () => {
      render(<Button {...defaultProps} text="Submit" />);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Button {...defaultProps} className="custom-class" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should merge className with base styles', () => {
      render(<Button {...defaultProps} className="m-4" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-green-600');
      expect(button).toHaveClass('m-4');
    });
  });

  describe('Button Types', () => {
    it('should default to type="button"', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should render submit button', () => {
      render(<Button {...defaultProps} type="submit" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render reset button', () => {
      render(<Button {...defaultProps} type="reset" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Variants', () => {
    it('should render primary variant with correct styles', () => {
      render(<Button {...defaultProps} variant="primary" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-green-600');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('hover:bg-green-700');
    });

    it('should render secondary variant with correct styles', () => {
      render(<Button {...defaultProps} variant="secondary" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-emerald-100');
      expect(button).toHaveClass('text-emerald-800');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-emerald-200');
    });

    it('should render outline variant with correct styles', () => {
      render(<Button {...defaultProps} variant="outline" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-green-700');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-green-600');
    });

    it('should default to primary variant', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-green-600');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Button {...defaultProps} size="sm" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-sm');
    });

    it('should render medium size', () => {
      render(<Button {...defaultProps} size="md" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-base');
    });

    it('should render large size', () => {
      render(<Button {...defaultProps} size="lg" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-lg');
    });

    it('should default to medium size', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button {...defaultProps} onClick={handleClick} />);
      const button = screen.getByTestId('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button {...defaultProps} onClick={handleClick} disabled />);
      const button = screen.getByTestId('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should pass event to onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button {...defaultProps} onClick={handleClick} />);
      const button = screen.getByTestId('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      render(<Button {...defaultProps} disabled />);
      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
    });

    it('should have disabled styles', () => {
      render(<Button {...defaultProps} disabled />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should not be disabled by default', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label from text when not provided', () => {
      render(<Button {...defaultProps} text="Submit Form" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('aria-label', 'Submit Form');
    });

    it('should use custom aria-label when provided', () => {
      render(<Button {...defaultProps} ariaLabel="Custom label" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should have focus ring styles', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
    });

    it('should have proper test id', () => {
      render(<Button {...defaultProps} />);
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('should have hover scale animation', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('hover:scale-105');
    });

    it('should have active scale animation', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('active:scale-95');
    });

    it('should have hover translate animation', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('hover:-translate-y-0.5');
    });

    it('should have transition classes', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('transition-all');
      expect(button).toHaveClass('duration-300');
    });

    it('should have transform class', () => {
      render(<Button {...defaultProps} />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('transform');
    });
  });

  describe('Green/Earthy Theme', () => {
    it('should use green colors for primary variant', () => {
      render(<Button {...defaultProps} variant="primary" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-green-600');
      expect(button).toHaveClass('hover:bg-green-700');
      expect(button).toHaveClass('focus:ring-green-500');
    });

    it('should use emerald colors for secondary variant', () => {
      render(<Button {...defaultProps} variant="secondary" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-emerald-100');
      expect(button).toHaveClass('text-emerald-800');
      expect(button).toHaveClass('border-emerald-200');
    });

    it('should use green colors for outline variant', () => {
      render(<Button {...defaultProps} variant="outline" />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('text-green-700');
      expect(button).toHaveClass('border-green-600');
      expect(button).toHaveClass('hover:bg-green-50');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty className', () => {
      render(<Button {...defaultProps} className="" />);
      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle className with extra spaces', () => {
      render(<Button {...defaultProps} className="  m-4  p-2  " />);
      const button = screen.getByTestId('button');
      expect(button).toHaveClass('m-4');
      expect(button).toHaveClass('p-2');
    });

    it('should handle empty text', () => {
      render(<Button {...defaultProps} text="" />);
      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });
  });
});

