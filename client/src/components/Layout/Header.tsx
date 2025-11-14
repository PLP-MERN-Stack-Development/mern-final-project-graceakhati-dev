import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600">
            🌍 Planet Path
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              to="/catalog"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Courses
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Dashboard
            </Link>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;

