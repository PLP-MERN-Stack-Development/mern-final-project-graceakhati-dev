import { Link } from 'react-router-dom';
import ImageLoader from './imageloader';
import { uiIllustrations } from '@/utils/imagePaths';

export type ErrorType = '404' | 'offline' | 'generic';

export interface ErrorPageProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  className?: string;
}

function ErrorPage({
  type = 'generic',
  title,
  message,
  showHomeButton = true,
  className = '',
}: ErrorPageProps) {
  // Get image and default messages based on error type
  const getErrorContent = () => {
    switch (type) {
      case '404':
        return {
          image: uiIllustrations.error404,
          defaultTitle: 'Oops! Page Not Found',
          defaultMessage:
            "The page you're looking for seems to have wandered off into the digital wilderness. Let's get you back on track!",
        };
      case 'offline':
        return {
          image: uiIllustrations.errorOffline,
          defaultTitle: "You're Offline",
          defaultMessage:
            "Looks like you've lost your internet connection. Don't worry, Planet Path works offline too! Check your connection and try again.",
        };
      case 'generic':
      default:
        return {
          image: uiIllustrations.errorOffline,
          defaultTitle: 'Something Went Wrong',
          defaultMessage:
            "We encountered an unexpected error. Don't worry, our team has been notified. Please try again later.",
        };
    }
  };

  const content = getErrorContent();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-green-50 to-white ${className}`}
      data-testid={`error-page-${type}`}
    >
      {/* Error Illustration */}
      <div className="mb-8 animate-wiggle">
        <ImageLoader
          src={content.image}
          alt={content.defaultTitle}
          className="w-64 h-64 md:w-80 md:h-80"
          lazy={false}
        />
      </div>

      {/* Error Code (for 404) */}
      {type === '404' && (
        <div className="mb-4">
          <span className="text-6xl md:text-8xl font-bold text-green-600">
            404
          </span>
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
        {title || content.defaultTitle}
      </h1>

      {/* Message */}
      <p className="text-gray-600 text-lg md:text-xl max-w-lg text-center mb-8">
        {message || content.defaultMessage}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {showHomeButton && (
          <Link
            to="/"
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-center"
          >
            Go Home
          </Link>
        )}
        <button
          onClick={() => window.history.back()}
          className="px-8 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all duration-200 transform hover:scale-105 text-center"
        >
          Go Back
        </button>
      </div>

      {/* Additional Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <Link
            to="/contact"
            className="text-green-600 hover:text-green-700 underline"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ErrorPage;

