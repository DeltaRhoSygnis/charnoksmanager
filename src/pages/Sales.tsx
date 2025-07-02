
import { useAuth } from '@/hooks/useAuth';
import { RecordSale } from '@/components/sales/RecordSale';
import { SalesHistory } from '@/components/sales/SalesHistory';

export const Sales = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === 'worker' ? <RecordSale /> : <SalesHistory />}
    </div>
  );
};
