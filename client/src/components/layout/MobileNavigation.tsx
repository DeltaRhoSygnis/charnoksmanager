
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
} from "lucide-react";

export const MobileNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  const ownerNavItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/products", label: "Products", icon: Package },
    { path: "/sales", label: "Sales", icon: ShoppingCart },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const workerNavItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/sales", label: "Sales", icon: ShoppingCart },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const navItems = user?.role === "owner" ? ownerNavItems : workerNavItems;
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-orange-100 z-50">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              isActive(path)
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-orange-50"
            }`}
          >
            <Icon className="h-5 w-5 mb-1" />
            {label}
            {isActive(path) && (
              <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs px-1 py-0">
                •
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
