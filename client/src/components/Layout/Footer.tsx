function Footer() {
  return (
    <footer className="bg-white border-t border-green-100 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Planet Path. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a
              href="/about"
              className="text-gray-600 hover:text-planet-green-dark text-sm transition-colors"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-gray-600 hover:text-planet-green-dark text-sm transition-colors"
            >
              Contact
            </a>
            <a
              href="/privacy"
              className="text-gray-600 hover:text-planet-green-dark text-sm transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
