import { useAuth } from "@/hooks/useAuth";
import { RecordSale } from "@/components/sales/RecordSale";
import { SalesHistory } from "@/components/sales/SalesHistory";
import { EnhancedSalesInterface } from "@/components/sales/EnhancedSalesInterface";
import { UniversalLayout } from "@/components/layout/UniversalLayout";
import { ShoppingCart, Star, TrendingUp } from "lucide-react";

export const Sales = () => {
  const { user } = useAuth();

  if (user?.role === "worker") {
    return (
      <UniversalLayout>
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
                Quick Sales
              </h1>
              <p className="text-xl text-white font-medium animate-slide-in-right">
                Tap products to sell or use voice input for faster transactions
              </p>
            </div>

            {/* Enhanced Sales Interface */}
            <div className="animate-slide-in-left delay-300">
              <EnhancedSalesInterface />
            </div>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-bounce-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                <TrendingUp className="w-full h-full text-blue-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold charnoks-text animate-slide-in-left">
              Sales Management
            </h1>
            <p className="text-xl text-white font-medium animate-slide-in-right">
              Monitor and analyze your restaurant's sales performance
            </p>
          </div>

          {/* Sales History */}
          <div className="animate-slide-in-right delay-300">
            <SalesHistory />
          </div>
        </div>
      </div>
    </UniversalLayout>
  );
};