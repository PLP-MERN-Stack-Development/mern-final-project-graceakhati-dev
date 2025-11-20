import { useState } from 'react';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';

// Mock users data - replace with real data from backend
const mockUsers = [
  { id: 'u-1', name: 'John Doe', email: 'john@example.com', role: 'student', joined: '2024-01-15' },
  { id: 'u-2', name: 'Jane Smith', email: 'jane@example.com', role: 'instructor', joined: '2024-01-10' },
  { id: 'u-3', name: 'Admin User', email: 'admin@example.com', role: 'admin', joined: '2024-01-01' },
];

function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-sand via-soft-white to-light-sand p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-playful text-forest-green mb-4 animate-scale-pulse">
            User Management 👥
          </h1>
          <p className="text-earth-brown text-lg font-medium">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border-2 border-leaf-green/40 rounded-lg focus:outline-none focus:border-leaf-green focus:ring-2 focus:ring-leaf-green/20 bg-white transition-all duration-200"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <EmptyState type="courses" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-6 bg-soft-white animate-fade-in">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-playful font-bold text-forest-green mb-1">
                      {user.name}
                    </h3>
                    <p className="text-earth-brown text-sm">{user.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin'
                        ? 'bg-forest-green text-soft-white'
                        : user.role === 'instructor'
                          ? 'bg-leaf-green text-soft-white'
                          : 'bg-earth-brown text-soft-white'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="text-sm text-earth-brown mb-4">
                  Joined: {new Date(user.joined).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-leaf-green text-soft-white rounded-lg font-playful font-bold transition-all duration-300 transform hover:scale-105 active:scale-95">
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2 border-2 border-earth-brown text-earth-brown rounded-lg font-playful font-bold transition-all duration-300 transform hover:scale-105 active:scale-95">
                    View
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;

