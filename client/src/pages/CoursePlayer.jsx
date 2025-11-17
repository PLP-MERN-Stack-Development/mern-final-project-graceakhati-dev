import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCourseService } from '@/hooks/useCourseService';
import { useSubmissionService } from '@/hooks/useSubmissionService';
import { useAuthStore } from '@/store/useAuthStore';
import SubmitProjectModal from '@/components/SubmitProjectModal';

/**
 * CoursePlayer - Page for viewing a course with enroll and submit project functionality
 */
function CoursePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { getCourse, enroll, isLoading: courseLoading, error: courseError } = useCourseService();
  const { getMySubmissions, isLoading: submissionsLoading } = useSubmissionService();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [hasSubmission, setHasSubmission] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  // Check if we're on the submit route
  useEffect(() => {
    if (location.pathname.includes('/submit')) {
      setIsModalOpen(true);
      // Clean up URL by removing /submit
      navigate(`/courses/${id}`, { replace: true });
    }
  }, [location.pathname, id, navigate]);

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      try {
        const courseData = await getCourse(id);
        setCourse(courseData);
      } catch (err) {
        console.error('Failed to load course:', err);
      }
    };
    loadCourse();
  }, [id, getCourse]);

  // Check enrollment status and submissions
  useEffect(() => {
    const checkEnrollmentAndSubmissions = async () => {
      if (!id || !user) return;
      
      // TODO: Check enrollment status via API
      // For now, we'll assume not enrolled initially
      // You can add an endpoint to check enrollment: GET /api/enrollments/user/:userId
      
      // Check if user has submissions for this course
      try {
        const submissions = await getMySubmissions(id);
        setHasSubmission(submissions && submissions.length > 0);
      } catch (err) {
        // If endpoint doesn't exist, that's okay
        console.warn('Could not check submissions:', err);
      }
    };
    
    checkEnrollmentAndSubmissions();
  }, [id, user, getMySubmissions]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!id || !user) {
      navigate('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      await enroll(id);
      setIsEnrolled(true);
      alert('Successfully enrolled in course!');
    } catch (err) {
      if (err.message?.includes('already enrolled')) {
        setIsEnrolled(true);
      } else {
        alert(err.message || 'Failed to enroll in course');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  // Handle project submission success
  const handleSubmissionSuccess = (submission) => {
    setSubmissionSuccess(true);
    setHasSubmission(true);
    // Store submission data to display aiScore
    setSubmissionData(submission);
    setTimeout(() => {
      setSubmissionSuccess(false);
    }, 10000); // Hide success message after 10 seconds
  };

  // Handle submit project button click
  const handleSubmitProject = () => {
    if (!isEnrolled) {
      alert('Please enroll in the course first');
      return;
    }
    setIsModalOpen(true);
  };

  if (courseLoading && !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (courseError && !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load course: {courseError}</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Courses
          </button>
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

      {/* Course Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">
          {course.title || course.name}
        </h1>
        <p className="text-gray-600 text-lg">
          {course.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-4">
        {!isEnrolled ? (
          <button
            onClick={handleEnroll}
            disabled={isEnrolling || !user}
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
                {course.modules.map((module, index) => (
                  <li key={module._id || index} className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold">{index + 1}. {module.title}</span>
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
        onClose={() => setIsModalOpen(false)}
        courseId={id}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  );
}

export default CoursePlayer;

