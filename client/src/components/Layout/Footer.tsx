import { Link } from 'react-router-dom';
import ProtectedLink from '@/components/auth/protectedlink';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-planet-green-dark to-planet-brown-dark text-white mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-playful font-bold mb-4">About Planet Path</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Empowering African youth with climate action education and skills for a sustainable future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-playful font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-200 hover:text-leaf-green transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <ProtectedLink
                  to="/catalog"
                  className="text-sm text-gray-200 hover:text-leaf-green transition-colors duration-200"
                >
                  Courses
                </ProtectedLink>
              </li>
              <li>
                <ProtectedLink
                  to="/projects"
                  className="text-sm text-gray-200 hover:text-leaf-green transition-colors duration-200"
                >
                  Projects
                </ProtectedLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-playful font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-200 hover:text-leaf-green transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-200 hover:text-leaf-green transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-gray-200 hover:text-leaf-green transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-playful font-bold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/planetpath"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-leaf-green transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/planetpath"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-leaf-green transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/planetpath"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-leaf-green transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="white" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-600 pt-8 text-center">
          <p className="text-sm text-gray-300">
            © {currentYear} Planet Path. All rights reserved. Made with 🌱 for climate action.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Aligned with SDG 4 (Quality Education), SDG 8 (Decent Work), and SDG 13 (Climate Action)
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


