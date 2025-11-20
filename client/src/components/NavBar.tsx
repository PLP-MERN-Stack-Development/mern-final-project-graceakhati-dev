import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import ImageLoader from './ImageLoader';
import { navIcons, dashboardAvatars } from '@/utils/imagePaths';

export interface NavBarProps {
  currentPage?: string;
}

interface NavLink {
  path: string;
  label: string;
  icon?: string;
  roles?: Array<'student' | 'instructor' | 'admin'>;
}

function NavBar({ currentPage: _currentPage }: NavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, role } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Base navigation links (visible to all)
  const baseLinks: NavLink[] = [
    { path: '/', label: 'Home', icon: navIcons.home },
    { path: '/courses', label: 'Courses', icon: navIcons.courses },
  ];

  // Role-specific navigation links
  const roleLinks: NavLink[] = [
    { path: '/dashboard', label: 'Dashboard', icon: navIcons.dashboard, roles: ['student'] },
    { path: '/instructor', label: 'Instructor', icon: navIcons.dashboard, roles: ['instructor'] },
    { path: '/admin', label: 'Admin', icon: navIcons.dashboard, roles: ['admin'] },
  ];

  // Get navigation links based on user role
  const getNavLinks = (): NavLink[] => {
    const links = [...baseLinks];
    if (isAuthenticated && role) {
      const roleSpecificLink = roleLinks.find((link) => link.roles?.includes(role));
      if (roleSpecificLink) {
        links.push(roleSpecificLink);
      }
    }
    return links;
  };

  const navLinks = getNavLinks();

  // Check if a link is active
  const isActiveLink = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Close mobile menu when link is clicked
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-50 bg-white border-b border-green-100 shadow-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            data-testid="navbar-logo"
            className="flex items-center space-x-2 text-planet-green-dark hover:text-planet-green-dark/80 transition-colors"
            onClick={handleMobileLinkClick}
          >
            <ImageLoader
              src={navIcons.leaf}
              alt="Planet Path Logo"
              className="w-8 h-8"
            />
            <span className="hidden md:inline-block font-planet text-xl font-bold">
              Planet Path
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.path}`}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? 'bg-planet-green-dark text-white'
                    : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                }`}
                aria-current={isActiveLink(link.path) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}

            {/* Login Button (when not authenticated) */}
            {!isAuthenticated && (
              <Link
                to="/login"
                data-testid="nav-link-/login"
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink('/login')
                    ? 'bg-planet-green-dark text-white'
                    : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                }`}
              >
                Login
              </Link>
            )}

            {/* User Menu (when authenticated) */}
            {isAuthenticated && user && (
              <div className="relative ml-2">
                <button
                  data-testid="user-menu-button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <ImageLoader
                    src={dashboardAvatars.default}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden lg:inline-block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-green-100 py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            data-testid="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          data-testid="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`mobile-nav-link-${link.path}`}
                className={`block px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink(link.path)
                    ? 'bg-planet-green-dark text-white'
                    : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                }`}
                onClick={handleMobileLinkClick}
              >
                {link.label}
              </Link>
            ))}

            {/* Login Link (when not authenticated) */}
            {!isAuthenticated && (
              <Link
                to="/login"
                data-testid="mobile-nav-link-/login"
                className={`block px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink('/login')
                    ? 'bg-planet-green-dark text-white'
                    : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                }`}
                onClick={handleMobileLinkClick}
              >
                Login
              </Link>
            )}

            {/* User Menu (when authenticated) */}
            {isAuthenticated && user && (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:text-planet-green-dark hover:bg-green-50 transition-all duration-200"
                  onClick={handleMobileLinkClick}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    handleMobileLinkClick();
                  }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:text-planet-green-dark hover:bg-green-50 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}

export default NavBar;
