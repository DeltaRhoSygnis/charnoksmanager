import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigation } from '@/components/layout/Navigation';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  className?: string;
}

export const ResponsiveLayout = ({ 
  children, 
  showNavigation = true,
  className
}: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Navigation */}
      {!isMobile && showNavigation && <Navigation />}
      
      {/* Mobile Navigation */}
      {isMobile && showNavigation && <MobileNavigation />}
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        isMobile ? "pt-16 pb-24 px-4" : "ml-64 px-6 py-6",
        className
      )}>
        {children}
      </main>
      
      {/* Status Bar for Desktop */}
      {!isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-8 flex items-center px-64 text-xs text-gray-500 z-10">
          <div className="flex items-center mr-4">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            Live Mode
          </div>
          <div className="flex-1"></div>
          <div>Charnoks POS v2.0</div>
        </div>
      )}
    </div>
  );
};