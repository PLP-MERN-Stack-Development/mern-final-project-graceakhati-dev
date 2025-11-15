import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/context/AuthContext';
import ImageLoader from '@/components/ImageLoader';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { uiIllustrations } from '@/utils/imagePaths';

function SignupPage() {
  const navigate = useNavigate();
  const { signup, signupWithGoogle, user, isAuthenticated } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  /**
   * Handle redirect after successful signup
   */
  useEffect(() => {
    if (shouldRedirect && isAuthenticated && user) {
      switch (user.role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'instructor':
          navigate('/instructor/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/student/dashboard');
      }
      setShouldRedirect(false);
    }
  }, [shouldRedirect, isAuthenticated, user, navigate]);

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
      // Call signup function from auth context
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });

      // Set flag to trigger redirect via useEffect
      setShouldRedirect(true);
    } catch (error) {
      // Handle signup errors
      setErrors({
        general: error instanceof Error ? error.message : 'Signup failed. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Google signup
   */
  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await signupWithGoogle();
      // Set flag to trigger redirect via useEffect
      setShouldRedirect(true);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Google signup failed. Please try again.',
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
                disabled={isSubmitting}
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
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-leaf-green/40 focus:border-leaf-green focus:ring-leaf-green/20 bg-white'
                  }`}
                  placeholder="Enter your email"
                  disabled={isSubmitting || isGoogleLoading}
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
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-leaf-green/40 focus:border-leaf-green focus:ring-leaf-green/20 bg-white'
                  }`}
                  placeholder="Create a password"
                  disabled={isSubmitting || isGoogleLoading}
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

