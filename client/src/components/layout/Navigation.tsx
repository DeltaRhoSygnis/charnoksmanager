
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileNavigation } from "./MobileNavigation";
import {
  Home,
  Package,
  ShoppingCart,
  LogOut,
  BarChart3,
  FileText,
  Receipt,
  Activity,
  TrendingUp,
  Bell,
  User,
} from "lucide-react";

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const ownerNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/products", label: "Products", icon: Package },
    { path: "/sales", label: "Sales", icon: ShoppingCart },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/transactions", label: "Transactions", icon: Activity },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/data-analysis", label: "Data Analysis", icon: TrendingUp },
    { path: "/reports", label: "Reports", icon: FileText },
  ];

  const workerNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/sales", label: "Sales", icon: ShoppingCart },
    { path: "/expenses", label: "Expenses", icon: Receipt },
  ];

  const navItems = user?.role === "owner" ? ownerNavItems : workerNavItems;
  const isActive = (path: string) => location.pathname === path;

  if (isMobile) {
    return <MobileNavigation />;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png"
                  alt="Charnoks"
                  className="h-10 w-10 object-contain group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg blur-lg group-hover:blur-xl transition-all duration-300" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                  Charnoks POS
                </span>
                <div className="text-xs text-white/60 font-medium">Special Fried Chicken</div>
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="hidden lg:flex space-x-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isActive(path)
                      ? "bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white shadow-lg shadow-orange-500/25 scale-105"
                      : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-105"
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${isActive(path) ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                  {label}
                  {isActive(path) && (
                    <div className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">{user?.email?.split('@')[0]}</div>
                <Badge
                  variant={user?.role === "owner" ? "default" : "secondary"}
                  className="text-xs bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white border-0"
                >
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={logout}
              className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Items */}
        <div className="lg:hidden pb-4 pt-2">
          <div className="flex flex-wrap gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(path)
                    ? "bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/10"
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
