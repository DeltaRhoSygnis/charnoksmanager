import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { StreamlinedSalesInterface } from "@/components/sales/StreamlinedSalesInterface";
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";
import { ShoppingCart } from "lucide-react";

export const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  return (
    <OptimizedLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-bounce-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                <ShoppingCart className="w-full h-full text-green-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold charnoks-text animate-slide-in-left">
              Worker Sales Terminal
            </h1>
            <p className="text-xl text-white font-medium animate-slide-in-right">
              Quick and efficient sales recording system
            </p>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              Welcome back, {user?.email?.split('@')[0]}!
            </Badge>
          </div>

          {/* Streamlined Sales Interface */}
          <div className="animate-slide-in-left delay-300">
            <StreamlinedSalesInterface />
          </div>
        </div>
      </div>
    </OptimizedLayout>
  );
};