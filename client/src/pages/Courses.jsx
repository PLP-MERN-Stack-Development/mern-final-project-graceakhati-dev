import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseService } from '@/hooks/useCourseService';

/**
 * Courses - Page listing all available courses
 */
function Courses() {
  const navigate = useNavigate();
  const { getCourses, isLoading, error } = useCourseService();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await getCourses();
        setCourses(result.courses || []);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    loadCourses();
  }, [getCourses]);

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load courses: {error}</p>
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
            <div
              key={course._id || course.id}
              onClick={() => handleCourseClick(course._id || course.id)}
              className="bg-white rounded-xl border-2 border-green-100 shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {course.title || course.name}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {course.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {course.level || 'All Levels'}
                </span>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;

