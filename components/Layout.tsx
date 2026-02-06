
import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTopButton } from './ScrollToTopButton';
import { CookieBanner } from './privacy/CookieBanner';
import { BreadcrumbTrail } from './BreadcrumbTrail';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <BreadcrumbTrail />
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>
      <ScrollToTopButton />
      <CookieBanner />
      <Footer />
    </div>
  );
};
