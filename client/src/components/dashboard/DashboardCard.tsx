import { ReactNode } from 'react';
import Card from '@/components/Card';

export interface DashboardCardProps {
  /**
   * Card title
   */
  title: string;
  /**
   * Card content/value
   */
  value: ReactNode;
  /**
   * Optional icon/emoji
   */
  icon?: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Color theme
   */
  color?: 'forest-green' | 'leaf-green' | 'earth-brown';
}

/**
 * DashboardCard Component
 *
 * A card component specifically designed for dashboard displays.
 * Includes smooth hover animations and playful styling.
 *
 * @example
 * ```tsx
 * <DashboardCard
 *   title="Total Courses"
 *   value={42}
 *   icon="📚"
 *   description="Available courses"
 *   onClick={() => navigate('/courses')}
 * />
 * ```
 */
function DashboardCard({
  title,
  value,
  icon,
  description,
  onClick,
  className = '',
  color = 'forest-green',
}: DashboardCardProps) {
  const colorClasses = {
    'forest-green': 'bg-forest-green text-soft-white',
    'leaf-green': 'bg-leaf-green text-soft-white',
    'earth-brown': 'bg-earth-brown text-soft-white',
  };

  return (
    <Card
      onClick={onClick}
      className={`p-6 bg-soft-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && <span className="text-4xl">{icon}</span>}
        {title && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${colorClasses[color]}`}>
            {title}
          </span>
        )}
      </div>
      <div className="text-3xl font-playful font-bold text-forest-green mb-2">
        {value}
      </div>
      {description && (
        <p className="text-sm text-earth-brown font-medium">{description}</p>
      )}
    </Card>
  );
}

export default DashboardCard;

