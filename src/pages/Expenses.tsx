
import { useAuth } from '@/hooks/useAuth';
import { RecordExpense } from '@/components/expenses/RecordExpense';
import { ExpensesHistory } from '@/components/expenses/ExpensesHistory';

export const Expenses = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === 'worker' ? <RecordExpense /> : <ExpensesHistory />}
    </div>
  );
};
