import { useAuth } from "@/hooks/useAuth";
import { RecordSale } from "@/components/sales/RecordSale";
import { SalesHistory } from "@/components/sales/SalesHistory";
import { WorkerSalesInterface } from "@/components/sales/WorkerSalesInterface";

export const Sales = () => {
  const { user } = useAuth();

  if (user?.role === "worker") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quick Sales</h1>
            <p className="text-gray-600 mt-2">
              Tap products to sell or use voice input
            </p>
          </div>
          <WorkerSalesInterface />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SalesHistory />
    </div>
  );
};
