import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTopButton } from './ScrollToTopButton';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      {/* Added pb-20 on mobile to account for persistent bottom navbar */}
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  );
};
