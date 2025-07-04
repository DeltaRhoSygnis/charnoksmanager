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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
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
      {/* Mobile Header - Compact */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white p-0.5 h-7 w-7"
              >
                {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
              <div className="flex items-center space-x-1.5">
                <img 
                  src={charnofsLogo} 
                  alt="Charnoks" 
                  className="h-6 w-6 object-contain"
                />
                <div>
                  <h1 className="text-xs font-bold charnoks-text">Charnoks</h1>
                  <p className="text-[10px] text-white/70">{isOwner ? 'Owner' : 'Worker'}</p>
                </div>
              </div>
            </div>
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="text-white p-0.5 h-7 w-7">
                ⚙️
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Compact */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-[240px] w-full bg-black/80 backdrop-blur-xl">
            <div className="flex-1 h-0 pt-3 pb-2 overflow-y-auto">
              <nav className="mt-2 px-1.5 space-y-0.5">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "group flex items-center px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                      location.pathname === item.path
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className="text-sm mr-1.5">{item.emoji}</span>
                    <span className="ml-1">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-white/20 p-2">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="ml-1.5">
                    <p className="text-xs font-medium text-white">{user?.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-white/70">{user?.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 p-0.5 h-6 w-6"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Content - Compact */}
      <div className="pb-12">
        {children}
      </div>

      {/* Mobile Bottom Navigation - Compact */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/20 z-30">
        <div className="grid grid-cols-5 h-12">
          {filteredNavItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center space-y-0.5 text-[10px] transition-all duration-200",
                location.pathname === item.path
                  ? "text-orange-400"
                  : "text-white/70"
              )}
            >
              <span className="text-sm">{item.emoji}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="min-h-screen flex galaxy-animated cosmic-overlay">
      {/* Desktop Sidebar */}
      <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/20">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <img 
                src={charnofsLogo} 
                alt="Charnoks" 
                className="h-12 w-12 object-contain animate-pulse-glow"
              />
              <div>
                <h1 className="text-2xl font-bold charnoks-text">Charnoks POS</h1>
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
          </div>

          <nav className="flex-1 px-4 pb-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-orange-500/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="text-xl mr-3">{item.emoji}</span>
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/20">
            <Link
              to="/settings"
              className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <span className="text-xl mr-3">⚙️</span>
              <Settings className="h-4 w-4" />
              <span className="ml-3">Settings</span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full mt-2 justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>

          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-white/70">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};