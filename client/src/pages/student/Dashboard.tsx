import { useState, useEffect } from 'react';
import ImageLoader from '@/components/ImageLoader';
import CourseCard from '@/components/CourseCard';
import ProtectedLink from '@/components/auth/ProtectedLink';
import { useAuthStore } from '@/store/useAuthStore';
import courseService, { Course } from '@/services/courseService';
import {
  dashboardAvatars,
  dashboardBadges,
} from '@/utils/imagePaths';


/**
 * Course Card with Enroll Button Component
 */
interface EnrollableCourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced';
    tags?: string[];
    price?: number;
  };
  isEnrolled: boolean;
  onEnroll: (courseId: string) => void;
}

function EnrollableCourseCard({ course, isEnrolled, onEnroll }: EnrollableCourseCardProps) {
  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEnroll(course.id);
  };

  return (
    <div className="relative group">
      <CourseCard
        id={course.id}
        title={course.title}
        description={course.description}
        image={course.image}
        level={course.level || 'Beginner'}
        tags={course.tags}
        price={course.price}
      />
      {!isEnrolled && (
        <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center z-10">
          <button
            onClick={handleEnrollClick}
            data-testid={`enroll-btn-${course.id}`}
            className="px-6 py-3 bg-planet-green-dark text-white rounded-lg font-semibold hover:bg-planet-green-dark/90 transition-all duration-200 transform hover:scale-105 shadow-lg"
            aria-label={`Enroll in ${course.title}`}
          >
            Enroll Now
          </button>
        </div>
      )}
      {isEnrolled && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-md">
            Enrolled
          </span>
        </div>
      )}
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load courses and enrollment data - SECURITY: Only after authentication
  useEffect(() => {
    const loadData = async () => {
      // SECURITY: Verify authentication before making API calls
      if (!user) {
        setIsLoading(false);
        setError('Authentication required');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Load all published courses
        const coursesData = await courseService.getCourses({ status: 'published' });
        setCourses(coursesData.courses || []);

        // Load user's enrollments
        // For MVP, we'll check enrollment status for each course
        const enrolled: Course[] = [];
        for (const course of coursesData.courses || []) {
          const courseId = course._id || course.id || '';
          if (courseId) {
            try {
              const isEnrolled = await courseService.checkEnrollment(courseId);
              if (isEnrolled) {
                enrolled.push(course);
              }
            } catch (err: any) {
              // Handle authentication errors
              if (err.code === 'AUTH_REQUIRED' || err.response?.status === 401) {
                setError('Authentication required');
                return;
              }
              // Continue with other courses if one fails
            }
          }
        }
        setEnrolledCourses(enrolled);
      } catch (err: any) {
        // Handle authentication errors
        if (err.code === 'AUTH_REQUIRED' || err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(err.message || 'Failed to load courses');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Calculate progress
  const overallProgress = enrolledCourses.length > 0 
    ? Math.min(100, Math.round((enrolledCourses.length / Math.max(courses.length, 1)) * 100))
    : 0;

  /**
   * Handle course enrollment
   */
  const handleEnroll = async (courseId: string) => {
    if (!user) {
      alert('Please log in to enroll in courses');
      return;
    }

    try {
      await courseService.enroll(courseId);
      // Reload courses to update enrollment status
      const coursesData = await courseService.getCourses({ status: 'published' });
      setCourses(coursesData.courses || []);
      
      // Check enrollment status again
      const enrolled: Course[] = [];
      for (const course of coursesData.courses || []) {
        const id = course._id || course.id || '';
        if (id) {
          const isEnrolled = await courseService.checkEnrollment(id);
          if (isEnrolled) {
            enrolled.push(course);
          }
        }
      }
      setEnrolledCourses(enrolled);
    } catch (err: any) {
      alert(err.message || 'Failed to enroll in course');
    }
  };

  // Get user avatar (default if not specified)
  const userAvatar = dashboardAvatars.default;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg max-w-md mx-auto">
            <p className="text-red-600 font-semibold">Failed to load dashboard</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get available courses (not enrolled)
  const availableCourses = courses.filter((course) => {
    const courseId = course._id || course.id || '';
    return !enrolledCourses.some((enrolled) => (enrolled._id || enrolled.id) === courseId);
  });

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 font-planet">
        My Learning Dashboard
      </h1>

      {/* Welcome Card */}
      <div className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-6 md:p-8 mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <ImageLoader
              src={userAvatar}
              alt={user?.name || 'Student Avatar'}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-green-200 shadow-md hover:animate-bounce transition-transform duration-300"
              lazy={false}
            />
          </div>

          {/* Welcome Text */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.name || 'Student'}! 👋
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Continue your climate action journey and make a positive impact.
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                🌱 {enrolledCourses.length} Course{enrolledCourses.length !== 1 ? 's' : ''} Enrolled
              </span>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                🏆 {Object.keys(dashboardBadges).length} Badges Available
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                📜 Certificates
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker Bar */}
      <div className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-6 mb-8 animate-fade-in">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              Overall Learning Progress
            </h3>
            <span className="text-2xl md:text-3xl font-bold text-green-600">
              {overallProgress}%
            </span>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            {enrolledCourses.length > 0
              ? `You're making great progress! Keep learning to unlock more achievements.`
              : `Start enrolling in courses to begin your learning journey!`}
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 md:h-6">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-4 md:h-6 rounded-full transition-all duration-500 shadow-md"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Continue Learning Section */}
      {enrolledCourses.length > 0 && (
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Continue Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const courseId = course._id || course.id || '';
              return (
                <div
                  key={courseId}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <CourseCard
                    id={courseId}
                    title={course.title}
                    description={course.description}
                    image={undefined}
                    level={course.tags?.includes('beginner') ? 'Beginner' : course.tags?.includes('advanced') ? 'Advanced' : 'Intermediate'}
                    tags={course.tags}
                    price={course.price}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Courses Section */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          {enrolledCourses.length > 0 ? 'Explore More Courses' : 'Available Courses'}
        </h2>
        {availableCourses.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-gray-600 font-semibold mb-2">No courses available</p>
            <p className="text-sm text-gray-500">Check back later for new courses!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => {
              const courseId = course._id || course.id || '';
              return (
                <div
                  key={courseId}
                  className="transform hover:scale-105 transition-transform duration-300"
                >
                  <EnrollableCourseCard
                    course={{
                      id: courseId,
                      title: course.title,
                      description: course.description,
                      image: undefined,
                      level: course.tags?.includes('beginner') ? 'Beginner' : course.tags?.includes('advanced') ? 'Advanced' : 'Intermediate',
                      tags: course.tags,
                      price: course.price,
                    }}
                    isEnrolled={false}
                    onEnroll={handleEnroll}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievements Row */}
      <div className="mb-8 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Your Achievements
        </h2>
        <div className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {Object.values(dashboardBadges).map((badge, index) => (
              <div
                key={index}
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <ImageLoader
                  src={badge}
                  alt={`Achievement badge ${index + 1}`}
                  className="w-16 h-16 md:w-20 md:h-20 group-hover:scale-110 transition-transform duration-300"
                  lazy={false}
                />
                <span className="mt-2 text-xs font-semibold text-gray-700 text-center">
                  Badge {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Project Progress Tracker */}
      <div className="animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Impact Projects
        </h2>
        <div className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Card 1 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  Tree Planting Initiative
                </h3>
                <span className="text-2xl">🌳</span>
              </div>
              <p className="text-gray-600 text-sm md:text-base mb-4">
                Join the community tree planting project in Nairobi.
              </p>
              <div className="mb-2">
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
              <ProtectedLink
                to="/projects"
                className="block w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 text-center"
              >
                Continue Project
              </ProtectedLink>
            </div>

            {/* Project Card 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  Beach Cleanup Drive
                </h3>
                <span className="text-2xl">🧹</span>
              </div>
              <p className="text-gray-600 text-sm md:text-base mb-4">
                Help clean up beaches and protect marine life.
              </p>
              <div className="mb-2">
                <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                  <span>Progress</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: '45%' }}
                  ></div>
                </div>
              </div>
              <ProtectedLink
                to="/projects"
                className="block w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 text-center"
              >
                Continue Project
              </ProtectedLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
