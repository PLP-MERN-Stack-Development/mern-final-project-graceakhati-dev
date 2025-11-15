import { ReactNode } from 'react';
import CourseCard from '@/components/CourseCard';

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  price: number;
}

export interface CourseListProps {
  /**
   * Array of courses to display
   */
  courses: Course[];
  /**
   * Callback when a course is clicked
   */
  onCourseClick?: (courseId: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Show empty state when no courses
   */
  showEmptyState?: boolean;
  /**
   * Custom empty state message
   */
  emptyMessage?: ReactNode;
}

/**
 * CourseList Component
 *
 * Displays a grid of course cards with smooth animations.
 *
 * @example
 * ```tsx
 * <CourseList
 *   courses={courses}
 *   onCourseClick={(id) => navigate(`/course/${id}`)}
 * />
 * ```
 */
function CourseList({
  courses,
  onCourseClick,
  className = '',
  showEmptyState = true,
  emptyMessage,
}: CourseListProps) {
  if (courses.length === 0 && showEmptyState) {
    return (
      <div className={`text-center py-12 ${className}`}>
        {emptyMessage || (
          <div className="text-earth-brown">
            <p className="text-xl font-playful font-bold mb-2">No courses found</p>
            <p>Check back later for new courses!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {courses.map((course, index) => (
        <div
          key={course.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div
            onClick={() => onCourseClick?.(course.id)}
            className="cursor-pointer transition-all duration-300 transform hover:scale-105"
          >
            <CourseCard
              id={course.id}
              title={course.title}
              description={course.description}
              image={course.image}
              level={course.level}
              tags={course.tags}
              price={course.price}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CourseList;

