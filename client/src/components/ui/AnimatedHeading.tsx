import { ReactNode } from 'react';

export interface AnimatedHeadingProps {
  /**
   * Heading text or content
   */
  children: ReactNode;
  /**
   * Heading level (h1-h6)
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Animation type
   */
  animation?: 'pulse' | 'wiggle' | 'scale-pulse' | 'motion-subtle' | 'none';
}

/**
 * AnimatedHeading Component
 *
 * A playful animated heading component with various animation options.
 * Uses the playful font family by default.
 *
 * @example
 * ```tsx
 * <AnimatedHeading level={1} animation="scale-pulse">
 *   Welcome to Planet Path!
 * </AnimatedHeading>
 * ```
 */
function AnimatedHeading({
  children,
  level = 1,
  className = '',
  animation = 'scale-pulse',
}: AnimatedHeadingProps) {
  const animationClass =
    animation === 'none' ? '' : `animate-${animation}`;

  const baseClasses = `font-playful font-bold text-forest-green ${animationClass} ${className}`;

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const sizeClasses = {
    1: 'text-4xl md:text-5xl lg:text-6xl',
    2: 'text-3xl md:text-4xl lg:text-5xl',
    3: 'text-2xl md:text-3xl lg:text-4xl',
    4: 'text-xl md:text-2xl lg:text-3xl',
    5: 'text-lg md:text-xl lg:text-2xl',
    6: 'text-base md:text-lg lg:text-xl',
  };

  return (
    <HeadingTag className={`${baseClasses} ${sizeClasses[level]}`}>
      {children}
    </HeadingTag>
  );
}

export default AnimatedHeading;

