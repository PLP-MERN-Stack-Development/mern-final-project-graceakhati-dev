function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome back, Grace! 👋</h1>

      {/* Progress Bars */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Learning Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Climate Science Basics</span>
              <span>60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: '60%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-2">
          <div className="p-4 border-l-4 border-green-600 bg-green-50">
            Completed: Introduction to Climate Change
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Badges</h2>
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center">
            🏆
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

