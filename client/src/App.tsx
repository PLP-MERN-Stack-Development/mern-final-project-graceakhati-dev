import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorPage from './components/ErrorPage';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Unauthorized from './pages/Unauthorized';
import Projects from './pages/Projects';
// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentCourse from './pages/student/Course';
import StudentProfile from './pages/student/Profile';
// Instructor pages
import InstructorDashboard from './pages/instructor/Dashboard';
import InstructorCreateCourse from './pages/instructor/CreateCourse';
import InstructorCourses from './pages/instructor/Courses';
import InstructorProfile from './pages/student/Profile'; // Reuse student profile
// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminProfile from './pages/student/Profile'; // Reuse student profile

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student Routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="courses" element={<StudentCourses />} />
                    <Route path="course/:id" element={<StudentCourse />} />
                    <Route path="profile" element={<StudentProfile />} />
                    {/* Default redirect for /student */}
                    <Route path="" element={<Navigate to="/student/dashboard" replace />} />
                    {/* Catch-all for student routes */}
                    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Instructor Routes */}
            <Route
              path="/instructor/*"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <Routes>
                    <Route path="dashboard" element={<InstructorDashboard />} />
                    <Route path="create-course" element={<InstructorCreateCourse />} />
                    <Route path="courses" element={<InstructorCourses />} />
                    <Route path="course/:id" element={<StudentCourse />} />
                    <Route path="profile" element={<InstructorProfile />} />
                    {/* Default redirect for /instructor */}
                    <Route path="" element={<Navigate to="/instructor/dashboard" replace />} />
                    {/* Catch-all for instructor routes */}
                    <Route path="*" element={<Navigate to="/instructor/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="course/:id" element={<StudentCourse />} />
                    <Route path="profile" element={<AdminProfile />} />
                    {/* Default redirect for /admin */}
                    <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
                    {/* Catch-all for admin routes */}
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Legacy Protected Routes (for backward compatibility) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Navigate to="/student/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/course/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                  <StudentCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <Navigate to="/instructor/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              }
            />

            {/* Projects - Public for now, can be protected later */}
            <Route path="/projects" element={<Projects />} />

            {/* Error Routes */}
            <Route path="/error/404" element={<ErrorPage type="404" />} />
            <Route path="/error/offline" element={<ErrorPage type="offline" />} />

            {/* Catch-all 404 route */}
            <Route path="*" element={<ErrorPage type="404" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
