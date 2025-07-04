import { ReactNode, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TrendingDown, 
  BarChart3, 
  CreditCard, 
  Settings, 
  Menu, 
  X,
  LogOut,
  User,
  Activity,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import charnofsLogo from '@assets/IMG_20250703_110727_1751555868705.png';

interface OptimizedLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerOnly?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Products', href: '/products', icon: Package, ownerOnly: true },
  { label: 'Sales', href: '/sales', icon: ShoppingCart },
  { label: 'Expenses', href: '/expenses', icon: TrendingDown },
  { label: 'Transactions', href: '/transactions', icon: CreditCard, ownerOnly: true, badge: 'New' },
  { label: 'Analytics', href: '/data-analysis', icon: BarChart3, ownerOnly: true, badge: 'Pro' },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const OptimizedLayout = ({ children, showNavigation = true }: OptimizedLayoutProps) => {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Get current path
  const currentPath = window.location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredNavItems = navItems.filter(item => 
    !item.ownerOnly || user?.role === 'owner'
  );

  if (!showNavigation) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="cosmic-background" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="cosmic-background" />
        
        {/* Mobile Header */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/90 backdrop-blur-xl' : 'bg-transparent'
        }`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <img 
                src={charnofsLogo} 
                alt="Charnoks" 
                className="h-10 w-auto object-contain"
              />
              <div>
                <h1 className="text-white font-bold text-lg charnoks-text">Charnoks POS</h1>
                <p className="text-gray-400 text-xs">{user?.role === 'owner' ? 'Owner' : 'Worker'}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/90 backdrop-blur-xl">
            <div className="pt-20 px-4">
              <div className="space-y-2">
                {filteredNavItems.map((item) => {
                  const isActive = currentPath === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-orange-500/20 border border-orange-500/30' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <item.icon className={`h-6 w-6 ${isActive ? 'text-orange-400' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto bg-orange-500/20 text-orange-300 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
                
                <div className="border-t border-white/20 pt-4 mt-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                    <User className="h-6 w-6 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{user?.email}</p>
                      <p className="text-gray-400 text-sm capitalize">{user?.role} Account</p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full mt-4 justify-start gap-4 p-4 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="h-6 w-6" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-xl border-t border-white/20">
          <div className="flex items-center justify-around py-2">
            {filteredNavItems.slice(0, 5).map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-orange-500/20 text-orange-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <item.icon className="h-5 w-5" />
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 pt-20 pb-20 px-4">
          {children}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen w-full relative flex">
      <div className="cosmic-background" />
      
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-72 bg-black/40 backdrop-blur-xl border-r border-white/20 z-40">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8">
            <img 
              src={charnofsLogo} 
              alt="Charnoks" 
              className="h-12 w-auto object-contain animate-pulse-glow"
            />
            <div>
              <h1 className="text-white font-bold text-xl charnoks-text">Charnoks POS</h1>
              <p className="text-gray-400 text-sm">Professional Point of Sale</p>
            </div>
          </div>

          {/* User Info */}
          <Card className="bg-white/5 border-white/20 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{user?.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        user?.role === 'owner' 
                          ? 'bg-orange-500/20 text-orange-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {user?.role === 'owner' ? 'Owner' : 'Worker'}
                    </Badge>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <nav className="space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-orange-500/20 border border-orange-500/30 shadow-lg' 
                      : 'hover:bg-white/10 hover:translate-x-1'
                  }`}
                >
                  <item.icon className={`h-5 w-5 transition-all duration-300 ${
                    isActive 
                      ? 'text-orange-400' 
                      : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className={`font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="ml-auto bg-orange-500/20 text-orange-300 text-xs animate-pulse"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-orange-400 rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Stats */}
          {user?.role === 'owner' && (
            <Card className="bg-white/5 border-white/20 mt-8">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300 text-sm">Active</span>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">Workers</span>
                    </div>
                    <span className="text-blue-400 font-bold text-sm">Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logout Button */}
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full mt-6 justify-start gap-4 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72">
        <div className="relative z-10 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};