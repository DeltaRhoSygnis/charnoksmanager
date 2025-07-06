import React, { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { MobileNavigation } from './MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface UniversalLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export const UniversalLayout = ({ 
  children, 
  showNavigation = true, 
  className = "" 
}: UniversalLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`min-h-screen w-full relative ${className}`}>
      {/* Enhanced Cosmic Background */}
      <div className="fixed inset-0 galaxy-animated cosmic-overlay -z-10" />

      {/* Glassmorphism Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 -z-5" />

      {/* Navigation */}
      {showNavigation && (
        <div className="relative z-30">
          {isMobile ? <MobileNavigation /> : <Navigation />}
        </div>
      )}

      {/* Main Content */}
      <main className={`relative z-10 ${showNavigation ? (isMobile ? 'pb-20 pt-4' : 'pt-20') : ''} min-h-screen w-full`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="backdrop-blur-md bg-white/5 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Elements for Visual Enhancement */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-1">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
    </div>
  );
};