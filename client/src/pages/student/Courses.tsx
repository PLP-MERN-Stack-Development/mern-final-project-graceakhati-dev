import { useState } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '@/components/coursecard';
import { useCourseStore } from '@/store/useCourseStore';
import { useAuth } from '@/hooks/useAuth';
import { courseIcons } from '@/utils/imagePaths';
import EmptyState from '@/components/emptystate';

function StudentCourses() {
  const { user } = useAuth();
  const { courses, enrollments, enrollCourse } = useCourseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Get enrolled course IDs
  const enrolledIds = enrollments.map((e) => e.courseId);

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    // Map store level (Expert) to filter level (advanced)
    const courseLevelLower = course.level === 'Expert' ? 'advanced' : course.level.toLowerCase();
    const matchesLevel = selectedLevel === 'all' || courseLevelLower === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleEnroll = (courseId: string) => {
    if (!user) {
      alert('Please log in to enroll in courses');
      return;
    }
    enrollCourse(courseId, user.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-sand via-soft-white to-light-sand p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-playful text-forest-green mb-4 animate-scale-pulse">
            My Courses 🌱
          </h1>
          <p className="text-earth-brown text-lg font-medium">
            Continue learning and discover new courses
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
          />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <EmptyState type="courses" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledIds.includes(course.id);
              // Map course ID to icon key (handle various ID formats)
              const courseIcon = courseIcons.climateBasics; // Default fallback

              return (
                <div key={course.id} className="animate-fade-in">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    image={courseIcon}
                    level={course.level === 'Expert' ? 'Advanced' : course.level}
                    tags={course.tags}
                    price={course.price}
                  />
                  <div className="mt-4 flex gap-2">
                    {isEnrolled ? (
                      <Link
                        to={`/student/course/${course.id}`}
                        className="flex-1 px-4 py-2 bg-forest-green text-soft-white rounded-lg font-playful font-bold text-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      >
                        Continue Learning →
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="flex-1 px-4 py-2 bg-leaf-green text-soft-white rounded-lg font-playful font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCourses;

