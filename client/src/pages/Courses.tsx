import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseService, { Course } from '@/services/courseService';
import CourseCard from '@/components/CourseCard';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Courses Page - Lists all available courses
 * SECURITY: Only fetches data after authentication is verified
 * Uses GET /api/courses to load courses
 */
function Courses() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // SECURITY: Only fetch courses after authentication is confirmed
    const loadCourses = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Verify authentication before making API call
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        setError('Authentication required');
        navigate('/login?redirect=' + encodeURIComponent('/courses'));
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const result = await courseService.getCourses();
        setCourses(result.courses || []);
      } catch (err: any) {
        // Handle authentication errors
        if (err.code === 'AUTH_REQUIRED' || err.response?.status === 401) {
          setError('Authentication required');
          navigate('/login?redirect=' + encodeURIComponent('/courses'));
        } else {
          const errorMessage = err.message || 'Failed to load courses';
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourses();
  }, [authLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg max-w-md mx-auto">
            <p className="text-red-600 font-semibold">Failed to load courses</p>
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

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
        Available Courses
      </h1>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No courses available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id || course.id}
              id={course._id || course.id || ''}
              title={course.title}
              description={course.description}
              image={undefined} // Add image URL if available in backend
              level={course.tags?.includes('beginner') ? 'Beginner' : course.tags?.includes('advanced') ? 'Advanced' : 'Intermediate'}
              tags={course.tags}
              price={course.price}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;

