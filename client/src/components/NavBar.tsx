import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageLoader from './ImageLoader';
import { navIcons } from '@/utils/imagePaths';

export interface NavBarProps {
  currentPage?: string;
}

export type NavPage =
  | 'home'
  | 'courses'
  | 'dashboard'
  | 'projects'
  | 'badges'
  | 'certificates'
  | 'settings';

const navLinks: { label: string; path: string; page: NavPage; icon: string }[] = [
  { label: 'Home', path: '/', page: 'home', icon: navIcons.home },
  { label: 'Courses', path: '/catalog', page: 'courses', icon: navIcons.courses },
  { label: 'Dashboard', path: '/dashboard', page: 'dashboard', icon: navIcons.dashboard },
  { label: 'Projects', path: '/projects', page: 'projects', icon: navIcons.projects },
  { label: 'Badges', path: '/badges', page: 'badges', icon: navIcons.badges },
  { label: 'Certificates', path: '/certificates', page: 'certificates', icon: navIcons.certificates },
  { label: 'Settings', path: '/settings', page: 'settings', icon: navIcons.settings },
];

function NavBar({ currentPage }: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActive = (page: NavPage) => {
    return currentPage === page;
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
            {navLinks.map((link) => {
              const active = isActive(link.page);
              return (
                <Link
                  key={link.page}
                  to={link.path}
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-planet-green-dark text-white shadow-md'
                      : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                  }`}
                  data-testid={`nav-link-${link.page}`}
                  aria-current={active ? 'page' : undefined}
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
                      }`}
                      style={
                        !active
                          ? {
                              filter: 'brightness(0) saturate(100%) invert(18%) sepia(100%) saturate(1000%) hue-rotate(87deg) brightness(90%) contrast(90%)',
                            }
                          : undefined
                      }
                      lazy={false}
                    />
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
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
            {navLinks.map((link) => {
              const active = isActive(link.page);
              return (
                <Link
                  key={link.page}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    active
                      ? 'bg-planet-green-dark text-white shadow-md'
                      : 'text-gray-700 hover:text-planet-green-dark hover:bg-green-50'
                  }`}
                  data-testid={`mobile-nav-link-${link.page}`}
                  aria-current={active ? 'page' : undefined}
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
                      }`}
                      style={
                        !active
                          ? {
                              filter: 'brightness(0) saturate(100%) invert(18%) sepia(100%) saturate(1000%) hue-rotate(87deg) brightness(90%) contrast(90%)',
                            }
                          : undefined
                      }
                      lazy={false}
                    />
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;

