import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Package,
  ShoppingCart,
  Receipt,
  BarChart3,
  FileText,
  Settings,
  User,
  PieChart,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const ownerNavItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: Home,
      roles: ["owner", "worker"]
    },
    { 
      path: "/products", 
      label: "Products", 
      icon: Package,
      roles: ["owner", "worker"]
    },
    { 
      path: "/sales", 
      label: "Sales", 
      icon: ShoppingCart,
      roles: ["owner", "worker"]
    },
    { 
      path: "/expenses", 
      label: "Expenses", 
      icon: Receipt,
      roles: ["owner"]
    },
    { 
      path: "/reports", 
      label: "Reports", 
      icon: PieChart,
      roles: ["owner"]
    },
    { 
      path: "/settings", 
      label: "Settings", 
      icon: Settings,
      roles: ["owner", "worker"]
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
  const isActive = (path: string) => location.pathname === path;

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || "")
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-5 gap-0">
        {filteredNavItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center pt-3 pb-2 px-1 text-xs font-medium transition-colors duration-200 relative",
              isActive(path)
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            )}
          >
            <div className="relative">
              <Icon 
                className={cn(
                  "h-5 w-5 mb-1 transition-all",
                  isActive(path) ? "text-blue-600" : "text-gray-400"
                )} 
              />
              {isActive(path) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-600 border border-white"></div>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-medium mt-0.5",
              isActive(path) ? "text-blue-600" : "text-gray-500"
            )}>
              {label}
            </span>
          </Link>
        ))}
      </div>
      
      {/* Floating action button for primary action */}
      {user?.role === "worker" && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <Link 
            to="/sales/new" 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
          >
            <ShoppingCart className="h-6 w-6" />
          </Link>
        </div>
      )}
    </div>
  );
};