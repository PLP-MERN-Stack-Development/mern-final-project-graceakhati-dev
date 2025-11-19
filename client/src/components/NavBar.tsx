import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ImageLoader from './imageloader';
import ProtectedLink from './auth/protectedlink';
import { useAuthStore, UserRole } from '@/store/useAuthStore';
import { navIcons } from '@/utils/imagePaths';
import { dashboardAvatars } from '@/utils/imagePaths';

export interface NavBarProps {
  currentPage?: string;
}

interface NavLink {
  label: string;
  path: string;
  icon: string;
  ariaLabel: string;
  roles?: UserRole[]; // Roles that can see this link
}

function NavBar(_props: NavBarProps) {
  // Get auth from localStorage via useAuthStore
  const getAuthFromStorage = () => {
    try {
      const stored = localStorage.getItem('planet-path-auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          user: parsed.user || null,
          isAuthenticated: !!(parsed.user && parsed.token),
        };
      }
    } catch (error) {
      // Silently fail - return unauthenticated state
    }
    return { user: null, isAuthenticated: false };
  };

  const { user: storeUser, isAuthenticated: storeIsAuthenticated, logout } = useAuthStore();
  const { user: storageUser, isAuthenticated: storageIsAuthenticated } = getAuthFromStorage();
  
  // Use store user if available, otherwise fall back to storage
  const user = storeUser || storageUser;
  const isAuthenticated = storeIsAuthenticated || storageIsAuthenticated;

  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Call store logout (which also clears localStorage)
    logout();
    navigate('/');
    setIsDropdownOpen(false);
    closeMobileMenu();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  /**
   * Check if user has access to a link based on role
   */
  const hasAccessToLink = (link: NavLink): boolean => {
    // If no roles specified, anyone can see it
    if (!link.roles || link.roles.length === 0) {
      return true;
    }
    
    // If not authenticated, can't access role-restricted links
    if (!isAuthenticated || !user) {
      return false;
    }

    // Check if user's role is in allowed roles
    return link.roles.includes(user.role);
  };

  /**
   * Determine which links to show based on authentication and role
   */
  const getNavLinks = (): NavLink[] => {
    // Base links available to all users
    const baseLinks: NavLink[] = [
      {
        label: 'Courses',
        path: '/courses',
        icon: navIcons.courses,
        ariaLabel: 'Browse courses',
      },
    ];

    if (!isAuthenticated || !user) {
      // Not authenticated: show Login
      return [
        ...baseLinks,
        {
          label: 'About',
          path: '/',
          icon: navIcons.home,
          ariaLabel: 'About Planet Path',
        },
        {
          label: 'Login',
          path: '/login',
          icon: navIcons.settings,
          ariaLabel: 'Login to your account',
        },
      ];
    }

    // Role-specific links
    const roleLinks: NavLink[] = [];

    // Student links
    if (user.role === 'student') {
      roleLinks.push({
        label: 'Dashboard',
        path: '/student/dashboard',
        icon: navIcons.dashboard,
        ariaLabel: 'View your student dashboard',
        roles: ['student'],
      });
    }

    // Instructor links
    if (user.role === 'instructor') {
      roleLinks.push({
        label: 'Instructor',
        path: '/instructor',
        icon: navIcons.dashboard,
        ariaLabel: 'Go to instructor dashboard',
        roles: ['instructor'],
      });
    }

    // Admin links
    if (user.role === 'admin') {
      roleLinks.push({
        label: 'Admin',
        path: '/admin',
        icon: navIcons.settings,
        ariaLabel: 'Go to admin dashboard',
        roles: ['admin'],
      });
    }

    return [
      {
        label: 'Home',
        path: '/',
        icon: navIcons.home,
        ariaLabel: 'Go to home page',
      },
      ...baseLinks,
      ...roleLinks,
    ];
  };

  const navLinks = getNavLinks().filter(link => hasAccessToLink(link));

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-green-100"
      data-testid="navbar"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo Area */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-planet-green-dark hover:text-planet-green-dark/80 transition-colors duration-200 group"
            onClick={closeMobileMenu}
            data-testid="navbar-logo"
            aria-label="Planet Path Home"
          >
            <div className="group-hover:animate-bounce-hover transition-transform duration-200">
              <ImageLoader
                src={navIcons.leaf}
                alt="Planet Path Logo"
                className="w-8 h-8"
                lazy={false}
              />
            </div>
            <span className="text-xl font-bold hidden sm:inline text-planet-green-dark">
              Planet Path
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => {
              const active = isActive(link.path);
              // Check if link is to a protected route
              const isProtectedRoute = ['/courses', '/catalog', '/projects', '/student', '/instructor', '/admin'].some(
                route => link.path.startsWith(route)
              );
              
              // Use ProtectedLink for protected routes, regular Link for public routes
              const LinkComponent = isProtectedRoute ? ProtectedLink : Link;
              
              return (
                <LinkComponent
                  key={`${link.path}-${index}`}
                  to={link.path}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-planet-green-dark text-white shadow-md'
                      : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                  }`}
                  data-testid={`nav-link-${link.path}`}
                  aria-current={active ? 'page' : undefined}
                  aria-label={link.ariaLabel}
                  allowedRoles={link.roles}
                >
                  <div
                    className={`transition-transform duration-200 ${
                      active ? '' : 'group-hover:animate-bounce-hover'
                    }`}
                  >
                    <ImageLoader
                      src={link.icon}
                      alt={`${link.label} icon`}
                      className={`w-5 h-5 transition-all duration-200 ${
                        active
                          ? 'brightness-0 invert'
                          : 'opacity-60 group-hover:opacity-100'
                      } ${!active ? 'brightness-0 saturate-100 invert-[18%] sepia-[100%] saturate-[1000%] hue-rotate-[87deg] brightness-90 contrast-90' : ''}`}
                      lazy={false}
                    />
                  </div>
                  <span>{link.label}</span>
                </LinkComponent>
              );
            })}

            {/* Avatar Dropdown (if authenticated) */}
            {isAuthenticated && user && (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  data-testid="user-menu-button"
                >
                  <ImageLoader
                    src={dashboardAvatars.default}
                    alt={`${user.name} avatar`}
                    className="w-8 h-8 rounded-full border-2 border-green-200"
                    lazy={false}
                  />
                  <span className="font-medium text-gray-700 hidden lg:inline">
                    {user.name}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                      role="menuitem"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        closeMobileMenu();
                      }}
                      aria-label="View profile"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      role="menuitem"
                      aria-label="Logout"
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
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
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
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          data-testid="mobile-menu"
        >
          <div className="py-4 space-y-2">
            {navLinks.map((link, index) => {
              const active = isActive(link.path);
              // Check if link is to a protected route
              const isProtectedRoute = ['/courses', '/catalog', '/projects', '/student', '/instructor', '/admin'].some(
                route => link.path.startsWith(route)
              );
              
              // Use ProtectedLink for protected routes, regular Link for public routes
              const LinkComponent = isProtectedRoute ? ProtectedLink : Link;
              
              return (
                <LinkComponent
                  key={`${link.path}-${index}`}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    active
                      ? 'bg-planet-green-dark text-white shadow-md'
                      : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                  }`}
                  data-testid={`mobile-nav-link-${link.path}`}
                  aria-current={active ? 'page' : undefined}
                  aria-label={link.ariaLabel}
                  allowedRoles={link.roles}
                >
                  <div
                    className={`transition-transform duration-200 ${
                      active ? '' : 'group-hover:animate-bounce-hover'
                    }`}
                  >
                    <ImageLoader
                      src={link.icon}
                      alt={`${link.label} icon`}
                      className={`w-6 h-6 transition-all duration-200 ${
                        active
                          ? 'brightness-0 invert'
                          : 'opacity-60 group-hover:opacity-100'
                      } ${!active ? 'brightness-0 saturate-100 invert-[18%] sepia-[100%] saturate-[1000%] hue-rotate-[87deg] brightness-90 contrast-90' : ''}`}
                      lazy={false}
                    />
                  </div>
                  <span>{link.label}</span>
                </LinkComponent>
              );
            })}

            {/* Profile and Logout (Mobile - if authenticated) */}
            {isAuthenticated && user && (
              <>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? 'bg-planet-green-dark text-white shadow-md'
                      : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                  }`}
                  aria-label="View profile"
                  data-testid="mobile-nav-link-profile"
                >
                  <ImageLoader
                    src={dashboardAvatars.default}
                    alt={`${user.name} avatar`}
                    className="w-6 h-6 rounded-full border-2 border-green-200"
                    lazy={false}
                  />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200 text-left"
                  aria-label="Logout"
                  data-testid="mobile-nav-link-logout"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
