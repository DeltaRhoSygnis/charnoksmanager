import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNavigation } from "./MobileNavigation";
import {
  Home,
  Package,
  ShoppingCart,
  LogOut,
  BarChart3,
  FileText,
  Receipt,
  Users,
  Settings,
  PieChart,
  ClipboardList,
  User,
  Briefcase,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const ownerNavItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: Home,
      roles: ["owner"]
    },
    { 
      path: "/products", 
      label: "Products", 
      icon: Package,
      roles: ["owner"]
    },
    { 
      path: "/sales", 
      label: "Sales", 
      icon: ShoppingCart,
      roles: ["owner"]
    },
    { 
      path: "/expenses", 
      label: "Expenses", 
      icon: CreditCard,
      roles: ["owner"]
    },
    { 
      path: "/analytics", 
      label: "Analytics", 
      icon: BarChart3,
      roles: ["owner"]
    },
    { 
      path: "/reports", 
      label: "Reports", 
      icon: PieChart,
      roles: ["owner"]
    },
    { 
      path: "/workers", 
      label: "Team", 
      icon: Users,
      roles: ["owner"]
    },
    { 
      path: "/settings", 
      label: "Settings", 
      icon: Settings,
      roles: ["owner"]
    },
  ];

  const workerNavItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: Home,
      roles: ["worker"]
    },
    { 
      path: "/products", 
      label: "Products", 
      icon: Package,
      roles: ["worker"]
    },
    { 
      path: "/sales", 
      label: "Sales", 
      icon: ShoppingCart,
      roles: ["worker"]
    },
    { 
      path: "/shift", 
      label: "My Shift", 
      icon: ClipboardList,
      roles: ["worker"]
    },
    { 
      path: "/performance", 
      label: "Performance", 
      icon: BarChart3,
      roles: ["worker"]
    },
  ];

  const navItems = user?.role === "owner" ? ownerNavItems : workerNavItems;
  const isActive = (path: string) => location.pathname.startsWith(path);
  
  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || "")
  );

  if (isMobile) {
    return <MobileNavigation />;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png"
              alt="Charnoks"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">
              Charnoks <span className="text-blue-600">POS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {filteredNavItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg",
                  isActive(path)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
                {isActive(path) && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-blue-600"></span>
                )}
              </Link>
            ))}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right mr-2">
              <span className="text-sm font-medium text-gray-800">
                {user?.name || "User Name"}
              </span>
              <span className="text-xs text-gray-500">
                {user?.email || "user@example.com"}
              </span>
            </div>
            
            <Avatar className="h-9 w-9 border border-gray-200">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="bg-gray-100">
                <User className="h-5 w-5 text-gray-600" />
              </AvatarFallback>
            </Avatar>
            
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 hover:bg-gray-50 border-gray-200"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Sign Out
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};