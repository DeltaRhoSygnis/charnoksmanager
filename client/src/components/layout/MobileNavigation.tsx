
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Package,
  ShoppingCart,
  Receipt,
  Settings,
  Activity,
  Plus,
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
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-t border-white/20">
        <div className="safe-area-pb">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center p-3 rounded-2xl text-xs font-medium transition-all duration-300 transform ${
                  isActive(path)
                    ? "bg-gradient-to-t from-orange-500/90 to-red-500/90 text-white scale-110 shadow-lg shadow-orange-500/30"
                    : "text-white/70 hover:text-white hover:bg-white/10 hover:scale-105"
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 mb-1 ${isActive(path) ? 'text-white' : 'text-white/70'}`} />
                  {isActive(path) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="truncate w-full text-center">{label}</span>
                {isActive(path) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full" />
                )}
              </Link>
            ))}
            
            {/* Quick Action Button */}
            <div className="flex flex-col items-center p-3 rounded-2xl">
              <div className="relative">
                <div className="w-5 h-5 mb-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center animate-pulse">
                  <Plus className="h-3 w-3 text-white" />
                </div>
              </div>
              <span className="text-xs font-medium text-white/70 truncate w-full text-center">Quick</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safe area for bottom navigation */}
      <style jsx global>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
};
