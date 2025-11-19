import { ReactNode } from 'react';
import Card from '@/components/card';
import ImageLoader from '@/components/imageloader';
import { dashboardAvatars } from '@/utils/imagePaths';

export interface ProfileCardProps {
  /**
   * User's name
   */
  name: string;
  /**
   * User's email
   */
  email?: string;
  /**
   * User's role
   */
  role?: string;
  /**
   * Avatar image URL
   */
  avatar?: string;
  /**
   * Additional content to display
   */
  children?: ReactNode;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ProfileCard Component
 *
 * A card component for displaying user profile information.
 * Includes avatar, name, and role with playful styling.
 *
 * @example
 * ```tsx
 * <ProfileCard
 *   name="John Doe"
 *   email="john@example.com"
 *   role="Student"
 *   avatar="/assets/dashboard/avatar-default.png"
 * />
 * ```
 */
function ProfileCard({
  name,
  email,
  role,
  avatar,
  children,
  onClick,
  className = '',
}: ProfileCardProps) {
  const avatarSrc = avatar || dashboardAvatars.default;

  return (
    <Card
      onClick={onClick}
      className={`p-6 bg-soft-white hover:shadow-xl transition-all duration-300 ${
        onClick ? 'cursor-pointer transform hover:scale-105' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <ImageLoader
            src={avatarSrc}
            alt={name}
            className="w-16 h-16 rounded-full border-4 border-leaf-green/30 hover:animate-bounce transition-all duration-300"
            lazy={false}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-playful font-bold text-forest-green mb-1">
            {name}
          </h3>
          {email && (
            <p className="text-sm text-earth-brown font-medium mb-1">{email}</p>
          )}
          {role && (
            <span className="inline-block px-3 py-1 bg-leaf-green text-soft-white rounded-full text-xs font-bold">
              {role}
            </span>
          )}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}

export default ProfileCard;

