import { useAuth } from "@/hooks/useAuth";
import { RecordSale } from "@/components/sales/RecordSale";
import { SalesHistory } from "@/components/sales/SalesHistory";
import { StreamlinedSalesInterface } from "@/components/sales/StreamlinedSalesInterface";
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";
import { ShoppingCart, Star, TrendingUp } from "lucide-react";

export const Sales = () => {
  const { user } = useAuth();

  if (user?.role === "worker") {
    return (
      <OptimizedLayout>
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4 animate-bounce-in animation-resistant">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                  <ShoppingCart className="w-full h-full text-green-400" />
                </div>
              </div>
              <h1 className="text-responsive-2xl font-bold charnoks-text animate-slide-in-left card-title">
                Quick Sales Terminal
              </h1>
              <p className="text-responsive-base text-solid font-medium animate-slide-in-right">
                Streamlined sales recording without shopping cart
              </p>
            </div>

            {/* Streamlined Sales Interface */}
            <div className="animate-slide-in-left delay-300">
              <StreamlinedSalesInterface />
            </div>
          </div>
        </div>
      </OptimizedLayout>
    );
  }

  return (
    <OptimizedLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-bounce-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                <TrendingUp className="w-full h-full text-blue-400" />
              </div>
            </div>
            <h1 className="text-responsive-xl font-bold charnoks-text animate-slide-in-left card-title">
              Sales Management
            </h1>
            <p className="text-responsive-base text-solid font-medium animate-slide-in-right">
              Monitor and analyze your restaurant's sales performance
            </p>
          </div>

          {/* Sales History */}
          <div className="animate-slide-in-right delay-300">
            <SalesHistory />
          </div>
        </div>
      </div>
    </OptimizedLayout>
  );
};