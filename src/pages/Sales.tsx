
import { useAuth } from "@/hooks/useAuth";
import { RecordSale } from "@/components/sales/RecordSale";
import { SalesHistory } from "@/components/sales/SalesHistory";
import { WorkerSalesInterface } from "@/components/sales/WorkerSalesInterface";
import { ResponsiveLayout } from "@/components/dashboard/ResponsiveLayout";

export const Sales = () => {
  const { user } = useAuth();

  if (user?.role === "worker") {
    return (
      <ResponsiveLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Quick Sales</h1>
            <p className="text-gray-300 mt-2">
              Tap products to sell or use voice input
            </p>
          </div>
          <WorkerSalesInterface />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <SalesHistory />
    </ResponsiveLayout>
  );
};
