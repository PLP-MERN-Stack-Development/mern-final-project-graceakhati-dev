import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import authService from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import ImageLoader from '@/components/ImageLoader';
import { uiIllustrations } from '@/utils/imagePaths';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

/**
 * Login Page Component
 * Handles user authentication with email/password or Google OAuth
 * 
 * Features:
 * - Submits credentials to /api/auth/login via Axios
 * - Stores JWT and user info in localStorage
 * - Persists login on page refresh by reading JWT from localStorage
 * - Redirects to appropriate dashboard after login based on user role
 * - Displays error messages for invalid credentials
 * - Includes Google Sign-In button stub that calls /auth/google endpoint
 */
function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  /**
   * Save auth data to localStorage
   * FIX: Ensure proper JWT format and complete user data
   */
  const saveAuthToStorage = (user: any, token: string) => {
    try {
      // Validate token format before storing
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token format');
      }
      
      // Ensure user has required fields
      const userData = {
        id: user._id || user.id || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
      };
      
      const authData = {
        user: userData,
        token,
        isAuthenticated: true,
        role: userData.role,
      };
      
      localStorage.setItem('planet-path-auth-storage', JSON.stringify(authData));
    } catch (error) {
      // Log error but don't throw - let Zustand store handle it
      console.error('Failed to save auth to localStorage:', error);
    }
  };

  /**
   * Redirect user based on role - deterministic paths for E2E tests
   * Also checks for redirect query parameter to return user to intended page
   */
  const redirectByRole = useCallback((role: string) => {
    // Check if there's a redirect query parameter
    const redirectPath = searchParams.get('redirect');
    if (redirectPath) {
      // Redirect to intended page after login
      navigate(redirectPath, { replace: true });
      return;
    }
    
    // Otherwise redirect to role-specific dashboard
    switch (role) {
      case 'student':
        navigate('/student/dashboard', { replace: true });
        break;
      case 'instructor':
        navigate('/instructor/dashboard', { replace: true });
        break;
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      default:
        navigate('/student/dashboard', { replace: true });
    }
  }, [navigate, searchParams]);

  // Check if user is already authenticated (persist login on refresh)
  // FIX: Extract OAuth token from URL query parameter
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // FIX: Check for OAuth token in URL (from Google OAuth redirect)
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
          // Store token temporarily in auth store so getCurrentUser can use it
          const authStore = useAuthStore.getState();
          if (authStore && typeof authStore.setToken === 'function') {
            authStore.setToken(tokenFromUrl);
          }
          
          // Fetch user info using the token
          try {
            const user = await authService.getCurrentUser();
            
            // Store auth data
            saveAuthToStorage(user, tokenFromUrl);
            
            // Update Zustand store with full user info
            if (authStore && typeof authStore.loginWithUser === 'function') {
              authStore.loginWithUser(
                {
                  id: user._id || user.id || '',
                  name: user.name,
                  email: user.email || '',
                  role: user.role as 'student' | 'instructor' | 'admin',
                  googleId: (user as any).googleId,
                  xp: (user as any).xp,
                  badges: (user as any).badges,
                },
                tokenFromUrl
              );
            }
            
            // Remove token from URL for security
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect to appropriate dashboard based on user role
            redirectByRole(user.role);
          } catch (error) {
            console.error('Failed to fetch user info with OAuth token:', error);
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Clear token from store
            if (authStore && typeof authStore.logout === 'function') {
              authStore.logout();
            }
            // Show error and stay on login page
            setErrors({
              general: 'Failed to complete Google sign-in. Please try again.',
            });
          }
          return;
        }
        
        const stored = localStorage.getItem('planet-path-auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          const token = parsed.token;
          const user = parsed.user;
          
          // Validate JWT format (basic check)
          if (token && typeof token === 'string' && token.split('.').length === 3) {
            // User is authenticated - redirect based on role or redirect param
            const redirectPath = searchParams.get('redirect');
            if (redirectPath) {
              navigate(redirectPath, { replace: true });
            } else {
              redirectByRole(user?.role || 'student');
            }
          }
        }
      } catch (error) {
        // Invalid stored data - ignore and show login form
      }
    };
    
    checkAuthState();
  }, [navigate, searchParams, redirectByRole]);

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: undefined,
      }));
    }
  };

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Submits credentials to /api/auth/login via Axios
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit credentials to /api/auth/login via Axios (via authService)
      const { user, token } = await authService.login(
        formData.email.trim(),
        formData.password
      );

      // Store JWT and user info in localStorage for persistence
      saveAuthToStorage(user, token);

      // Update Zustand store synchronously before navigation
      const authStore = useAuthStore.getState();
      if (authStore && typeof authStore.loginWithUser === 'function') {
        authStore.loginWithUser(
          {
            id: user._id || user.id || '',
            name: user.name,
            email: user.email || '',
            role: user.role as 'student' | 'instructor' | 'admin',
            googleId: (user as any).googleId,
            xp: (user as any).xp,
            badges: (user as any).badges,
          },
          token
        );
      }

      // Redirect to appropriate dashboard after login based on user role
      redirectByRole(user.role);
    } catch (error: any) {
      // Display error messages for invalid credentials or signup errors
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error.isNetworkError) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.status === 401) {
        errorMessage = error.message || 'Invalid email or password. Please try again.';
      } else if (error.status === 400) {
        errorMessage = error.message || 'Invalid input. Please check your email and password.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        general: errorMessage,
      });
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Google Sign-In
   * Redirects to backend Google OAuth endpoint
   */
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Get the API base URL from environment or use default
    const apiUrl = import.meta.env.VITE_API_URL || 'https://planet-path-backend.onrender.com';
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${apiUrl}/api/auth/google`;
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-light-sand via-soft-white to-light-sand">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Illustration */}
          <div className="hidden lg:block text-center animate-fade-in">
            <div className="animate-motion-subtle">
              <ImageLoader
                src={uiIllustrations.onboardingEarthSmile}
                alt="Planet Path Login"
                className="w-full max-w-md mx-auto"
                lazy={false}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-forest-green mt-6 font-playful animate-scale-pulse">
              Welcome back! 🌍
            </h2>
            <p className="text-earth-brown mt-2 text-lg font-medium">
              Continue your climate action journey
            </p>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-soft-white rounded-2xl border-2 border-leaf-green/30 shadow-xl p-6 md:p-8 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-forest-green mb-2 font-playful animate-scale-pulse">
                Login
              </h1>
              <p className="text-earth-brown font-medium">Sign in to your account</p>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-semibold">{errors.general}</p>
              </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-earth-brown mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  data-testid="email-input"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-leaf-green/40 focus:border-leaf-green focus:ring-leaf-green/20 bg-white'
                  }`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-earth-brown mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  data-testid="password-input"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-leaf-green/40 focus:border-leaf-green focus:ring-leaf-green/20 bg-white'
                  }`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                data-testid="login-submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-4 bg-forest-green text-soft-white rounded-lg font-playful text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed hover:scale-100'
                    : 'hover:bg-forest-green/90 hover:shadow-2xl animate-motion-subtle'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-leaf-green/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-soft-white text-earth-brown font-medium">Or</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <GoogleLoginButton
              text="Continue with Google"
              onClick={handleGoogleLogin}
              isLoading={isGoogleLoading}
              disabled={isSubmitting}
            />

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-earth-brown font-medium">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-forest-green hover:text-leaf-green font-playful font-bold underline transition-all duration-200 hover:scale-105 inline-block"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Mobile Illustration */}
            <div className="lg:hidden mt-6 text-center">
              <ImageLoader
                src={uiIllustrations.onboardingEarthSmile}
                alt="Planet Path"
                className="w-48 h-48 mx-auto"
                lazy={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
