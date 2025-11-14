function Admin() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">1,234</div>
          <div className="text-sm text-gray-600">Users</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">45</div>
          <div className="text-sm text-gray-600">Courses</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">KES 89K</div>
          <div className="text-sm text-gray-600">Revenue</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">67</div>
          <div className="text-sm text-gray-600">Projects</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2">Grace Akhati</td>
                <td className="p-2">grace@example.com</td>
                <td className="p-2">Learner</td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Active
                  </span>
                </td>
                <td className="p-2">
                  <button className="text-sm text-blue-600">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;

