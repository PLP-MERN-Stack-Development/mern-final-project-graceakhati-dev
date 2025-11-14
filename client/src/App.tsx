import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import CoursePlayer from './pages/CoursePlayer';
import Dashboard from './pages/Dashboard';
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
          <Route path="/instructor" element={<Instructor />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

