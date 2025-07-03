
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigation } from '@/components/layout/Navigation';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

export const ResponsiveLayout = ({ children, showNavigation = true }: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {showNavigation && <Navigation />}
        <div className="px-4 py-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {showNavigation && <Navigation />}
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
};
