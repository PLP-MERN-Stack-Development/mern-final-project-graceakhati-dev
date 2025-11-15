import { Link } from 'react-router-dom';

function Footer() {
  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
  ];

  return (
    <footer
      className="bg-planet-brown-dark text-white mt-auto border-t-2 border-planet-green-dark"
      data-testid="footer"
    >
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm md:text-base text-planet-brown-light">
              © 2025 Planet Path. All rights reserved.
            </p>
          </div>

          {/* Footer Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm md:text-base text-planet-brown-light hover:text-planet-green-light transition-colors duration-200 hover:underline underline-offset-4"
                data-testid={`footer-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

