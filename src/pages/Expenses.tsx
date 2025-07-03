
import { useAuth } from '@/hooks/useAuth';
import { RecordExpense } from '@/components/expenses/RecordExpense';
import { ExpensesHistory } from '@/components/expenses/ExpensesHistory';

export const Expenses = () => {
  const { user } = useAuth();

  return user?.role === 'worker' ? <RecordExpense /> : <ExpensesHistory />;
};
