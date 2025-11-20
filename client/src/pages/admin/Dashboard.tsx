import { useCourseStore, Course } from '@/store/useCourseStore';
import Card from '@/components/Card';
import ImageLoader from '@/components/ImageLoader';

/**
 * Get status badge color
 */
const getStatusBadgeColor = (status: 'pending' | 'approved') => {
  return status === 'pending'
    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
    : 'bg-green-100 text-green-800 border-green-200';
};

/**
 * Get level badge color
 */
const getLevelBadgeColor = (level: string) => {
  const colors = {
    Beginner: 'bg-green-100 text-green-800 border-green-200',
    Intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
    Expert: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colors[level as keyof typeof colors] || colors.Beginner;
};

/**
 * Course Card Component
 */
interface CourseCardProps {
  course: Course;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

function CourseCard({ course, showActions = false, onApprove, onReject }: CourseCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Course Image */}
        {course.image && (
          <div className="flex-shrink-0">
            <ImageLoader
              src={course.image}
              alt={course.title}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              fallback="/assets/illustrations/error-offline-plant.png"
            />
          </div>
        )}

        {/* Course Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={`px-2 py-1 text-xs rounded-full border ${getStatusBadgeColor(
                course.status
              )}`}
            >
              {course.status}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full border ${getLevelBadgeColor(
                course.level
              )}`}
            >
              {course.level}
            </span>
            {course.tags.length > 0 && (
              <span className="px-2 py-1 text-xs rounded-full border bg-gray-100 text-gray-700 border-gray-200">
                {course.tags.length} tag{course.tags.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-sm font-semibold text-planet-green-dark mb-3">
            KES {course.price.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 mt-3">
              {onApprove && (
                <button
                  onClick={() => onApprove(course.id)}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-1"
                  aria-label={`Approve ${course.title}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Approve
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => onReject(course.id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-1"
                  aria-label={`Reject ${course.title}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function Admin() {
  const { courses, pending, approveCourse, rejectCourse, enrollments } = useCourseStore();

  /**
   * Handle approve course
   */
  const handleApprove = (id: string) => {
    if (window.confirm('Are you sure you want to approve this course?')) {
      approveCourse(id);
    }
  };

  /**
   * Handle reject course
   */
  const handleReject = (id: string) => {
    if (window.confirm('Are you sure you want to reject this course? This action cannot be undone.')) {
      rejectCourse(id);
    }
  };

  // Calculate analytics
  const totalUsers = new Set(enrollments.map((e) => e.userId)).size;
  const totalCourses = courses.length;
  const totalPending = pending.length;
  const totalEnrollments = enrollments.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-planet-green-dark mb-2 font-planet">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage courses, users, and platform analytics</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Users Card */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-planet-green-dark">{totalUsers}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <svg
                className="w-8 h-8 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Courses Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Approved Courses</p>
              <p className="text-3xl font-bold text-blue-700">{totalCourses}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <svg
                className="w-8 h-8 text-blue-700"
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
            </div>
          </div>
        </Card>

        {/* Pending Card */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-700">{totalPending}</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-full">
              <svg
                className="w-8 h-8 text-yellow-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Enrollments Card */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Enrollments</p>
              <p className="text-3xl font-bold text-purple-700">{totalEnrollments}</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <svg
                className="w-8 h-8 text-purple-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Management - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Courses Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-planet-green-dark font-planet">
              Pending Courses
            </h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold border border-yellow-200">
              {pending.length}
            </span>
          </div>

          {pending.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-semibold mb-2">No pending courses</p>
              <p className="text-sm text-gray-500">All courses have been reviewed</p>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {pending.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  showActions={true}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Approved Courses Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-planet-green-dark font-planet">
              Approved Courses
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">
              {courses.length}
            </span>
          </div>

          {courses.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-semibold mb-2">No approved courses</p>
              <p className="text-sm text-gray-500">Approve courses to see them here</p>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} showActions={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
