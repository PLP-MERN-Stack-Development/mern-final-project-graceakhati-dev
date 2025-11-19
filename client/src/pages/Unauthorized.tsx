import { Link } from 'react-router-dom';
import ImageLoader from '@/components/imageloader';
import { useAuth } from '@/hooks/useAuth';
import { uiIllustrations } from '@/utils/imagePaths';

/**
 * Unauthorized Page
 *
 * Displayed when a user tries to access a route they don't have permission for.
 */
function Unauthorized() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Redirect will happen via ProtectedRoute after logout
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-green-50 to-white">
      {/* Illustration */}
      <div className="mb-8 animate-wiggle">
        <ImageLoader
          src={uiIllustrations.error404}
          alt="Unauthorized Access"
          className="w-64 h-64 md:w-80 md:h-80"
          lazy={false}
        />
      </div>

      {/* Error Code */}
      <div className="mb-4">
        <span className="text-6xl md:text-8xl font-bold text-orange-600">
          403
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">
        Access Denied
      </h1>

      {/* Message */}
      <p className="text-gray-600 text-lg md:text-xl max-w-lg text-center mb-8">
        You do not have permission to view this page.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg text-center"
        >
          Return Home
        </Link>
        <button
          onClick={handleLogout}
          className="px-8 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all duration-200 transform hover:scale-105 text-center"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
