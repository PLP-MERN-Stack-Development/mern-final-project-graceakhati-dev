import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import courseService, { Course } from '@/services/courseService';
import submissionService, { Submission } from '@/services/submissionService';
import { useAuthStore } from '@/store/useAuthStore';
import SubmitProjectModal from '@/components/SubmitProjectModal';
import ProtectedButton from '@/components/auth/ProtectedButton';

/**
 * CoursePlayer - Page for viewing a course with enroll and submit project functionality
 * SECURITY: Only fetches data after authentication is verified
 * Uses GET /api/courses/:id, POST /api/enrollments, and submission service
 */
function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [hasSubmission, setHasSubmission] = useState(false);
  const [submissionData, setSubmissionData] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on the submit route
  useEffect(() => {
    if (location.pathname.includes('/submit')) {
      setIsModalOpen(true);
      // Clean up URL by removing /submit
      navigate(`/courses/${id}`, { replace: true });
    }
  }, [location.pathname, id, navigate]);

  // Load course data - SECURITY: Only after authentication
  useEffect(() => {
    const loadCourse = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // SECURITY: Verify authentication before making API call
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setError('Authentication required');
        navigate('/login?redirect=' + encodeURIComponent(`/courses/${id}`));
        return;
      }

      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const courseData = await courseService.getCourse(id);
        setCourse(courseData);
      } catch (err: any) {
        // Handle authentication errors
        if (err.code === 'AUTH_REQUIRED' || err.response?.status === 401) {
          setError('Authentication required');
          navigate('/login?redirect=' + encodeURIComponent(`/courses/${id}`));
        } else {
          const errorMessage = err.message || 'Failed to load course';
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadCourse();
  }, [id, authLoading, isAuthenticated, user, navigate]);

  // Check enrollment status and submissions - SECURITY: Only after authentication
  useEffect(() => {
    const checkEnrollmentAndSubmissions = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // SECURITY: Verify authentication before making API calls
      if (!isAuthenticated || !user || !id) {
        setIsCheckingEnrollment(false);
        return;
      }
      
      setIsCheckingEnrollment(true);
      
      try {
        // Check enrollment status
        const enrolled = await courseService.checkEnrollment(id);
        setIsEnrolled(enrolled);
        
        // Check if user has submissions for this course
        try {
          const submissions = await submissionService.getMySubmissions(id);
          setHasSubmission(submissions && submissions.length > 0);
        } catch (err: any) {
          // Handle authentication errors
          if (err.code === 'AUTH_REQUIRED' || err.response?.status === 401) {
            navigate('/login?redirect=' + encodeURIComponent(`/courses/${id}`));
          }
          // If endpoint doesn't exist, that's okay - silently fail
        }
      } catch (err: any) {
        // Handle authentication errors
        if (err.code === 'AUTH_REQUIRED' || err.response?.status === 401) {
          navigate('/login?redirect=' + encodeURIComponent(`/courses/${id}`));
        }
        // If endpoint doesn't exist, that's okay - silently fail
      } finally {
        setIsCheckingEnrollment(false);
      }
    };
    
    checkEnrollmentAndSubmissions();
  }, [id, user, authLoading, isAuthenticated, navigate]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!id || !user) {
      navigate('/login');
      return;
    }

    setIsEnrolling(true);
    setError(null);
    try {
      await courseService.enroll(id);
      setIsEnrolled(true);
      // Show success message
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to enroll in course';
      if (errorMessage.includes('already enrolled')) {
        setIsEnrolled(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  // Handle project submission success
  const handleSubmissionSuccess = (submission: Submission) => {
    setSubmissionSuccess(true);
    setHasSubmission(true);
    setSubmissionData(submission);
    setTimeout(() => {
      setSubmissionSuccess(false);
    }, 10000); // Hide success message after 10 seconds
  };

  // Handle submit project button click
  const handleSubmitProject = () => {
    if (!isEnrolled) {
      setError('Please enroll in the course first');
      return;
    }
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg max-w-md mx-auto">
            <p className="text-red-600 font-semibold">Failed to load course</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
          </div>
          <ProtectedButton
            to="/courses"
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Courses
          </ProtectedButton>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Success Message with AI Score */}
      {submissionSuccess && submissionData && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold text-lg mb-2">
            ✓ Project Submitted Successfully!
          </p>
          {submissionData.aiScore !== undefined && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">AI Score:</span>
                <span className={`font-bold text-lg ${
                  submissionData.aiScore >= 60 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {submissionData.aiScore}/100
                </span>
              </div>
              {submissionData.verified && (
                <div className="flex items-center gap-2">
                  <span className="text-green-700 font-medium">✓ Verified</span>
                  <span className="text-sm text-gray-600">
                    (Score above 60 - You earned 50 XP!)
                  </span>
                </div>
              )}
              {!submissionData.verified && submissionData.aiScore < 60 && (
                <div className="text-orange-700 text-sm">
                  Score below 60. Add more details to improve your score!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* Course Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">
          {course.title}
        </h1>
        <p className="text-gray-600 text-lg">
          {course.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-4">
        {isCheckingEnrollment ? (
          <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold">
            Checking enrollment...
          </div>
        ) : !isEnrolled ? (
          <button
            onClick={handleEnroll}
            disabled={isEnrolling || !user}
            data-testid={`enroll-btn-${id}`}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
          >
            {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
          </button>
        ) : (
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold">
              ✓ Enrolled
            </div>
            <button
              onClick={handleSubmitProject}
              disabled={hasSubmission}
              data-testid="submit-project-button"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {hasSubmission ? 'Project Already Submitted' : 'Submit Project'}
            </button>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Content</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
            {course.description || 'Welcome to this course! Start by enrolling to access the content.'}
          </p>
          
          {course.modules && course.modules.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Modules</h3>
              <ul className="space-y-2">
                {course.modules.map((module: any, index: number) => (
                  <li key={typeof module === 'string' ? module : (module._id || index)} className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold">
                      {index + 1}. {typeof module === 'string' ? 'Module' : (module.title || 'Module')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Submit Project Modal */}
      <SubmitProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        courseId={id || ''}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  );
}

export default CoursePlayer;

