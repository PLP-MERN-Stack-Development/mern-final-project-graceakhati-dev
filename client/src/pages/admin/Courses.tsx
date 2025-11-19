import { useState } from 'react';
import { useCourseStore } from '@/store/useCourseStore';
import CourseCard from '@/components/coursecard';
import { courseIcons } from '@/utils/imagePaths';
import EmptyState from '@/components/emptystate';

function AdminCourses() {
  const { courses, pending, approveCourse, rejectCourse } = useCourseStore();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('pending');

  const filteredCourses =
    activeTab === 'all'
      ? [...courses, ...pending]
      : activeTab === 'pending'
        ? pending
        : courses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-sand via-soft-white to-light-sand p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-playful text-forest-green mb-4 animate-scale-pulse">
            Course Management 📚
          </h1>
          <p className="text-earth-brown text-lg font-medium">
            Review and approve course submissions
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b-2 border-leaf-green/30">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-playful font-bold transition-all duration-200 ${
              activeTab === 'pending'
                ? 'text-forest-green border-b-2 border-forest-green'
                : 'text-earth-brown hover:text-leaf-green'
            }`}
          >
            Pending Review ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-playful font-bold transition-all duration-200 ${
              activeTab === 'approved'
                ? 'text-forest-green border-b-2 border-forest-green'
                : 'text-earth-brown hover:text-leaf-green'
            }`}
          >
            Approved ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-playful font-bold transition-all duration-200 ${
              activeTab === 'all'
                ? 'text-forest-green border-b-2 border-forest-green'
                : 'text-earth-brown hover:text-leaf-green'
            }`}
          >
            All ({courses.length + pending.length})
          </button>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <EmptyState type="courses" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
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
                  <div className="mt-4 p-4 bg-soft-white rounded-lg border-2 border-leaf-green/30">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          course.status === 'approved'
                            ? 'bg-leaf-green text-white'
                            : 'bg-earth-brown text-soft-white'
                        }`}
                      >
                        {course.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                    {course.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveCourse(course.id)}
                          className="flex-1 px-4 py-2 bg-leaf-green text-soft-white rounded-lg font-playful font-bold transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                          Approve ✓
                        </button>
                        <button
                          onClick={() => rejectCourse(course.id)}
                          className="flex-1 px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-playful font-bold transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                          Reject
                        </button>
                      </div>
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

export default AdminCourses;

