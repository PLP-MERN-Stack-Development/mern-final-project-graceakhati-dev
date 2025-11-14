function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2025 Planet Path. All rights reserved.</p>
          </div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-green-400 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

