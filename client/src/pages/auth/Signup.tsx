import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import authService from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import ImageLoader from '@/components/ImageLoader';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { uiIllustrations } from '@/utils/imagePaths';

type UserRole = 'student' | 'instructor' | 'admin';

/**
 * Signup Page Component
 * Handles user registration with email/password or Google OAuth
 * 
 * Features:
 * - Submits credentials to /api/auth/register via Axios
 * - Stores JWT and user info in localStorage
 * - Persists login on page refresh by reading JWT from localStorage
 * - Redirects to appropriate dashboard after signup based on user role
 * - Displays error messages for signup errors
 * - Includes Google Sign-In button stub that calls /auth/google endpoint
 */
function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
  });

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
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
      // Redirect to intended page after signup
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
  useEffect(() => {
    const checkAuthState = () => {
      try {
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
        // Invalid stored data - ignore and show signup form
      }
    };
    
    checkAuthState();
  }, [navigate, searchParams, redirectByRole]);

  /**
   * Handle form input changes
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Submits credentials to /api/auth/register via Axios
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
      // Submit credentials to /api/auth/register via Axios (via authService)
      const { user, token } = await authService.register(
        formData.fullName.trim(),
        formData.email.trim(),
        formData.password,
        formData.role
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

      // Redirect to appropriate dashboard after signup based on user role
      redirectByRole(user.role);
    } catch (error: any) {
      // Display error messages for invalid credentials or signup errors
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.isNetworkError) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.status === 409) {
        errorMessage = error.message || 'An account with this email already exists. Please log in instead.';
      } else if (error.status === 400) {
        errorMessage = error.message || 'Invalid input. Please check your information and try again.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = error.message || 'Authentication failed. Please try again.';
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
   * Handle Google signup
   * Redirects to backend Google OAuth endpoint
   * After successful signup, backend redirects to /dashboard with JWT token
   */
  const handleGoogleSignup = () => {
    setIsGoogleLoading(true);
    setErrors({});
    
    try {
      // Get backend API URL from environment
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (!apiUrl) {
        throw new Error('VITE_API_URL is not configured');
      }
      
      // Remove trailing slash if present
      const cleanApiUrl = apiUrl.replace(/\/$/, '');
      const googleAuthUrl = `${cleanApiUrl}/auth/google`;
      
      // Store current path for redirect after OAuth
      const currentPath = searchParams.get('redirect') || window.location.pathname;
      const redirectUrl = currentPath !== '/' ? currentPath : '/dashboard';
      
      // Redirect to backend Google OAuth endpoint
      // Backend will handle OAuth flow and redirect back to frontend with token
      window.location.href = `${googleAuthUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
    } catch (error: any) {
      // Display error messages for Google OAuth errors
      let errorMessage = 'Google signup failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        general: errorMessage,
      });
      setIsGoogleLoading(false);
    }
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
                alt="Planet Path Signup"
                className="w-full max-w-md mx-auto"
                lazy={false}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-forest-green mt-6 font-playful animate-scale-pulse">
              Join Planet Path! 🌱
            </h2>
            <p className="text-earth-brown mt-2 text-lg font-medium">
              Start your climate action journey today
            </p>
          </div>

          {/* Right Side - Signup Form */}
          <div className="bg-soft-white rounded-2xl border-2 border-leaf-green/30 shadow-xl p-6 md:p-8 animate-fade-in">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-forest-green mb-2 font-playful animate-scale-pulse">
                Create Account
              </h1>
              <p className="text-earth-brown font-medium">Sign up to start learning</p>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-semibold">{errors.general}</p>
              </div>
            )}

            {/* Google Signup Button */}
            <div className="mb-6">
              <GoogleLoginButton
                text="Sign up with Google"
                onClick={handleGoogleSignup}
                disabled={isSubmitting || isGoogleLoading}
                isLoading={isGoogleLoading}
              />
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-leaf-green/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-soft-white text-earth-brown font-medium">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-earth-brown mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.fullName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-leaf-green/40 focus:border-leaf-green focus:ring-leaf-green/20 bg-white'
                  }`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting || isGoogleLoading}
                  required
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

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
                  disabled={isSubmitting || isGoogleLoading}
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
                  placeholder="Create a password"
                  disabled={isSubmitting || isGoogleLoading}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-earth-brown mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-leaf-green/40 focus:border-leaf-green focus:ring-leaf-green/20 bg-white'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting || isGoogleLoading}
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold text-earth-brown mb-2"
                >
                  I want to join as...
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 transition-all duration-200 bg-white hover:border-leaf-green/60"
                  disabled={isSubmitting || isGoogleLoading}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                data-testid="signup-submit"
                disabled={isSubmitting || isGoogleLoading}
                className={`w-full px-6 py-4 bg-forest-green text-soft-white rounded-lg font-playful text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                  isSubmitting || isGoogleLoading
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
                    Creating account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-earth-brown font-medium">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-forest-green hover:text-leaf-green font-playful font-bold underline transition-all duration-200 hover:scale-105 inline-block"
                >
                  Log in
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

export default SignupPage;
