
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  LogOut, 
  BarChart3, 
  FileText, 
  Receipt,
  Users
} from 'lucide-react';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const ownerNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  const workerNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/sales', label: 'Sales', icon: ShoppingCart },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
  ];

  const navItems = user?.role === 'owner' ? ownerNavItems : workerNavItems;
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
                alt="Charnoks" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Charnoks POS
              </span>
            </Link>
            <div className="hidden md:flex space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                  {isActive(path) && <Badge className="ml-2 bg-white/20 text-white border-white/30" variant="secondary">Active</Badge>}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge 
              variant={user?.role === 'owner' ? 'default' : 'secondary'}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
            >
              {user?.role?.toUpperCase()}
            </Badge>
            <Button variant="outline" onClick={logout} className="hover:bg-orange-50 border-orange-200">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
