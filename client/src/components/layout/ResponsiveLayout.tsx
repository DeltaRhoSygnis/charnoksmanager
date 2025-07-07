import React, { useState } from 'react';
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

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();


  const isOwner = user?.role === 'owner';

  // Enhanced navigation with strict role-based filtering
  const ownerNavItems = [
    { 
      icon: <Home className="h-4 w-4" />, 
      label: 'Home', 
      path: '/', 
      emoji: '🏠',
      description: 'Dashboard Overview'
    },
    { 
      icon: <BarChart3 className="h-4 w-4" />, 
      label: 'Analysis', 
      path: '/analysis', 
      emoji: '📊',
      description: 'Data & Reports'
    },
    { 
      icon: <Package className="h-4 w-4" />, 
      label: 'Products', 
      path: '/products', 
      emoji: '📦',
      description: 'Inventory Management'
    },
    { 
      icon: <ShoppingCart className="h-4 w-4" />, 
      label: 'Sales', 
      path: '/sales', 
      emoji: '💸',
      description: 'Point of Sale'
    },
    { 
      icon: <Receipt className="h-4 w-4" />, 
      label: 'Expenses', 
      path: '/expenses', 
      emoji: '🧾',
      description: 'Expense Tracking'
    },
    { 
      icon: <ClipboardList className="h-4 w-4" />, 
      label: 'Transactions', 
      path: '/transactions', 
      emoji: '📋',
      description: 'Transaction History'
    },
  ];

  const workerNavItems = [
    { 
      icon: <Home className="h-4 w-4" />, 
      label: 'Home', 
      path: '/', 
      emoji: '🏠',
      description: 'Quick Actions'
    },
    { 
      icon: <ShoppingCart className="h-4 w-4" />, 
      label: 'Sales', 
      path: '/sales', 
      emoji: '💸',
      description: 'Record Sales'
    },
    { 
      icon: <Receipt className="h-4 w-4" />, 
      label: 'Expenses', 
      path: '/expenses', 
      emoji: '🧾',
      description: 'Record Expenses'
    },
  ];

  const navItems = isOwner ? ownerNavItems : workerNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const MobileLayout = () => (
    <div className="min-h-screen w-full galaxy-animated cosmic-overlay">


      {/* Mobile Content with Enhanced Spacing */}
      <div className="pb-20 px-4 pt-4">
        <div className="mobile-optimized">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Enhanced */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-xl border-t border-white/20 z-30">
        <div className={cn(
          "grid h-16 px-2",
          navItems.length <= 3 ? "grid-cols-3" : navItems.length <= 4 ? "grid-cols-4" : "grid-cols-5"
        )}>
          {navItems.slice(0, 5).map((item) => (
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
    <div className="min-h-screen flex galaxy-animated cosmic-overlay">
      {/* Desktop Sidebar - Enhanced */}
      <div className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/20">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <img 
                src={charnofsLogo} 
                alt="Charnoks" 
                className="h-14 w-14 object-contain animate-pulse-glow"
              />
              <div>
                <h1 className="text-2xl font-bold charnoks-text">Charnoks POS</h1>
                <Badge className={cn(
                  "text-xs mt-1",
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
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border border-orange-500/30"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span className="text-2xl mr-4">{item.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">{item.description}</p>
                </div>
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
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
        <div className="desktop-optimized">
          {children}
        </div>
      </div>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};