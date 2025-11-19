import Card from '@/components/card';
import { useCourseStore } from '@/store/useCourseStore';

function AdminReports() {
  const { courses, pending } = useCourseStore();

  // Mock analytics data - replace with real data from backend
  const analytics = {
    totalUsers: 1250,
    totalCourses: courses.length,
    pendingCourses: pending.length,
    totalEnrollments: 3450,
    activeStudents: 890,
    revenue: 125000,
  };

  const stats = [
    { label: 'Total Users', value: analytics.totalUsers, icon: '👥', color: 'forest-green' },
    { label: 'Total Courses', value: analytics.totalCourses, icon: '📚', color: 'leaf-green' },
    { label: 'Pending Reviews', value: analytics.pendingCourses, icon: '⏳', color: 'earth-brown' },
    { label: 'Total Enrollments', value: analytics.totalEnrollments, icon: '🎓', color: 'forest-green' },
    { label: 'Active Students', value: analytics.activeStudents, icon: '🌟', color: 'leaf-green' },
    { label: 'Revenue (KES)', value: analytics.revenue.toLocaleString(), icon: '💰', color: 'earth-brown' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-sand via-soft-white to-light-sand p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-playful text-forest-green mb-4 animate-scale-pulse">
            Analytics & Reports 📊
          </h1>
          <p className="text-earth-brown text-lg font-medium">
            Platform insights and performance metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-soft-white animate-fade-in hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{stat.icon}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold bg-${stat.color} text-soft-white`}
                >
                  {stat.label}
                </span>
              </div>
              <div className="text-3xl font-playful font-bold text-forest-green">
                {stat.value}
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-soft-white animate-fade-in">
            <h2 className="text-2xl font-playful font-bold text-forest-green mb-4">
              Enrollment Trends
            </h2>
            <div className="h-64 flex items-center justify-center bg-light-sand rounded-lg">
              <p className="text-earth-brown font-medium">Chart placeholder - integrate charting library</p>
            </div>
          </Card>

          <Card className="p-6 bg-soft-white animate-fade-in">
            <h2 className="text-2xl font-playful font-bold text-forest-green mb-4">
              Course Performance
            </h2>
            <div className="h-64 flex items-center justify-center bg-light-sand rounded-lg">
              <p className="text-earth-brown font-medium">Chart placeholder - integrate charting library</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;

