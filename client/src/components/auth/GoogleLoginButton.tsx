import ImageLoader from '../imageloader';

export interface GoogleLoginButtonProps {
  /**
   * Button text to display
   */
  text: string;
  /**
   * Click handler function
   */
  onClick: () => void;
  /**
   * Optional className for additional styling
   */
  className?: string;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Whether the button is in loading state
   */
  isLoading?: boolean;
}

/**
 * GoogleLoginButton Component
 *
 * A reusable button component for Google OAuth authentication.
 * Features green/earth tones and playful hover animations.
 *
 * @example
 * ```tsx
 * <GoogleLoginButton
 *   text="Continue with Google"
 *   onClick={handleGoogleLogin}
 *   isLoading={isLoading}
 * />
 * ```
 */
function GoogleLoginButton({
  text,
  onClick,
  className = '',
  disabled = false,
  isLoading = false,
}: GoogleLoginButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
          className={`
            w-full px-6 py-3
            border-2 border-leaf-green/40 rounded-lg
            font-playful font-bold
            transition-all duration-300
            transform hover:scale-105 active:scale-95
            flex items-center justify-center gap-3
            bg-soft-white hover:bg-light-sand
            hover:border-leaf-green hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-leaf-green/20 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-soft-white
            group text-earth-brown hover:text-forest-green
            ${className}
          `}
      aria-label={text}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gray-700">Loading...</span>
        </>
      ) : (
        <>
          <ImageLoader
            src="/assets/icons/google.svg"
            alt="Google"
            className="w-5 h-5 flex-shrink-0"
            lazy={false}
          />
          <span className="text-gray-700 group-hover:text-planet-green-dark transition-colors duration-200">
            {text}
          </span>
        </>
      )}
    </button>
  );
}

export default GoogleLoginButton;

