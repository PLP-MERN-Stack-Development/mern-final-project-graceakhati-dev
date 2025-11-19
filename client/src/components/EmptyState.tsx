import ImageLoader from './imageloader';
import { uiIllustrations } from '@/utils/imagePaths';

export type EmptyStateType = 'courses' | 'projects' | 'progress' | 'notifications';

export interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function EmptyState({
  type,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  // Get image and default messages based on type
  const getEmptyStateContent = () => {
    switch (type) {
      case 'courses':
        return {
          image: uiIllustrations.emptyCourses,
          defaultTitle: 'No Courses Yet',
          defaultMessage:
            'Looks like there are no courses available right now. Check back soon for exciting climate action courses!',
        };
      case 'projects':
        return {
          image: uiIllustrations.emptyProjects,
          defaultTitle: 'No Projects Found',
          defaultMessage:
            'No impact projects available at the moment. New projects are added regularly, so stay tuned!',
        };
      case 'progress':
        return {
          image: uiIllustrations.emptyProgress,
          defaultTitle: 'No Progress Yet',
          defaultMessage:
            "You haven't started any courses yet. Begin your climate action journey by enrolling in a course!",
        };
      case 'notifications':
        return {
          image: uiIllustrations.emptyNotifications,
          defaultTitle: 'No Notifications',
          defaultMessage:
            "You're all caught up! No new notifications at the moment.",
        };
      default:
        return {
          image: uiIllustrations.emptyCourses,
          defaultTitle: 'Empty',
          defaultMessage: 'Nothing to display here.',
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 md:py-16 px-4 text-center ${className}`}
      data-testid={`empty-state-${type}`}
    >
      {/* Illustration */}
      <div className="mb-6 animate-bounce-slow">
        <ImageLoader
          src={content.image}
          alt={content.defaultTitle}
          className="w-48 h-48 md:w-64 md:h-64"
          lazy={false}
        />
      </div>

      {/* Title */}
      <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
        {title || content.defaultTitle}
      </h3>

      {/* Message */}
      <p className="text-gray-600 text-base md:text-lg max-w-md mb-6">
        {message || content.defaultMessage}
      </p>

      {/* Action Button (optional) */}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

