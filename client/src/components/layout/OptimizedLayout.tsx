import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home,
  BarChart3,
  Package,
  ShoppingCart,
  Receipt,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/animated-button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


const charnofsLogo = "/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png";

interface OptimizedLayoutProps {
  children: React.ReactNode;
}

export const OptimizedLayout: React.FC<OptimizedLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const isOwner = user?.role === 'owner';

  const navItems = [
    { 
      icon: <Home className="h-4 w-4" />, 
      label: 'Home', 
      path: '/', 
      emoji: '🏠',
      roles: ['owner', 'worker'] 
    },
    { 
      icon: <BarChart3 className="h-4 w-4" />, 
      label: 'Analysis', 
      path: '/analysis', 
      emoji: '📊',
      roles: ['owner'] 
    },
    { 
      icon: <Package className="h-4 w-4" />, 
      label: 'Products', 
      path: '/products', 
      emoji: '📦',
      roles: ['owner'] 
    },
    { 
      icon: <ShoppingCart className="h-4 w-4" />, 
      label: 'Sales', 
      path: '/sales', 
      emoji: '💸',
      roles: ['owner', 'worker'] 
    },
    { 
      icon: <Receipt className="h-4 w-4" />, 
      label: 'Expenses', 
      path: '/expenses', 
      emoji: '🧾',
      roles: ['owner', 'worker'] 
    },
    { 
      icon: <ClipboardList className="h-4 w-4" />, 
      label: 'Transactions', 
      path: '/transactions', 
      emoji: '📋',
      roles: ['owner'] 
    },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'worker'));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const MobileLayout = () => (
    <div className="min-h-screen w-full galaxy-animated cosmic-overlay">
      {/* Mobile Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={charnofsLogo} 
                alt="Charnoks" 
                className="h-10 w-10 object-contain animate-pulse-glow"
              />
              <div>
                <h1 className="text-base md:text-lg font-bold charnoks-text">Charnoks POS</h1>
                <Badge className={cn(
                  "text-xs",
                  isOwner 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                )}>
                  {isOwner ? 'Owner' : 'Worker'} Dashboard
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-5 md:w-6 h-5 md:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-white">{user?.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-white/70">{user?.email}</p>
                </div>
              </div>
              <Link to="/settings">
                <AnimatedButton variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2" ripple={true}>
                  <Settings className="h-4 w-4" />
                </AnimatedButton>
              </Link>
              <AnimatedButton
                variant="ghost"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2"
                ripple={true}
              >
                <LogOut className="h-3 md:h-4 w-3 md:w-4" />
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>

      

      {/* Mobile Content - Enhanced Spacing */}
      <div className="pb-20 px-4 pt-4 mobile-safe-area">
        <div className="mobile-optimized">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Enhanced */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-xl border-t border-white/20 z-30">
        <div className={cn(
          "grid h-16 px-2",
          filteredNavItems.length <= 3 ? "grid-cols-3" : filteredNavItems.length <= 4 ? "grid-cols-4" : "grid-cols-5"
        )}>
          {filteredNavItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-all duration-200 p-2 rounded-lg m-1",
                location.pathname === item.path
                  ? "text-orange-400 bg-orange-500/20 border border-orange-500/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="font-medium text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="min-h-screen w-full galaxy-animated cosmic-overlay">
      {/* Desktop Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={charnofsLogo} 
                alt="Charnoks" 
                className="h-12 w-12 object-contain animate-pulse-glow"
              />
              <div>
                <h1 className="text-xl font-bold charnoks-text">Charnoks POS</h1>
                <Badge className={cn(
                  "text-xs",
                  isOwner 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                )}>
                  {isOwner ? 'Owner' : 'Worker'} Dashboard
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>
              </div>
              <Link to="/settings">
                <Button variant="ghost" size="sm" className="text-white">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="w-full overflow-auto pb-16">
        {children}
      </div>

      {/* Desktop Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/20 z-30">
        <div className="flex justify-center">
          <div className="flex space-x-2 px-6 py-3">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-orange-500/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="text-lg">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};