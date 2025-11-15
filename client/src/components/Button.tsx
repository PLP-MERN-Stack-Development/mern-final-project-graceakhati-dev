import { MouseEvent } from 'react';

export interface ButtonProps {
  text: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

function Button({
  text,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  disabled = false,
  variant = 'primary',
  size = 'md',
}: ButtonProps) {
  const baseStyles =
    'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800',
    secondary:
      'bg-emerald-100 text-emerald-800 border-2 border-emerald-200 hover:bg-emerald-200 focus:ring-emerald-500 active:bg-emerald-300',
    outline:
      'bg-transparent text-green-700 border-2 border-green-600 hover:bg-green-50 focus:ring-green-500 active:bg-green-100',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const animationStyles =
    'hover:scale-105 active:scale-95 transform hover:-translate-y-0.5 active:translate-y-0';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${animationStyles} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClassName}
      disabled={disabled}
      aria-label={ariaLabel || text}
      data-testid="button"
    >
      {text}
    </button>
  );
}

export default Button;
