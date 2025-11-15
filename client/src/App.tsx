import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorPage from './components/ErrorPage';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import CoursePlayer from './pages/CoursePlayer';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Instructor from './pages/Instructor';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/course/:id" element={<CoursePlayer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/instructor" element={<Instructor />} />
          <Route path="/admin" element={<Admin />} />
          {/* Error Routes */}
          <Route path="/error/404" element={<ErrorPage type="404" />} />
          <Route path="/error/offline" element={<ErrorPage type="offline" />} />
          {/* Catch-all 404 route */}
          <Route path="*" element={<ErrorPage type="404" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

