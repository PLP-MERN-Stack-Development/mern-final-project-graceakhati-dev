import { ReactNode } from 'react';
import NavBar from '../navbar';
import Footer from './footer';

export interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
  currentPage?: string;
}

function Layout({ children, pageTitle, currentPage }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <NavBar currentPage={currentPage} />
      <main className="flex-grow container mx-auto px-4 py-8 w-full">
        {pageTitle && (
          <h1
            className="text-3xl md:text-4xl font-bold text-planet-green-dark mb-6 transition-opacity duration-300"
            data-testid="page-title"
          >
            {pageTitle}
          </h1>
        )}
        <div className="transition-opacity duration-300">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
