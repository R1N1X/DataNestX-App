import React from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

export interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};
