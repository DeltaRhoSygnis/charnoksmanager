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
    <div className={`min-h-screen w-full galaxy-animated cosmic-overlay ${className}`}>
      {/* Navigation */}
      {showNavigation && (
        <>
          {isMobile ? <MobileNavigation /> : <Navigation />}
        </>
      )}
      
      {/* Main Content */}
      <main className={`${showNavigation ? (isMobile ? 'pb-20' : 'pl-64') : ''} min-h-screen w-full relative z-10`}>
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
};