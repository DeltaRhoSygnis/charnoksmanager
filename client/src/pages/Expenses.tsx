import { useAuth } from '@/hooks/useAuth';
import { RecordExpense } from '@/components/expenses/RecordExpense';
import { ExpensesHistory } from '@/components/expenses/ExpensesHistory';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { Receipt, DollarSign, TrendingDown } from 'lucide-react';

export const Expenses = () => {
  const { user } = useAuth();

  if (user?.role === 'worker') {
    return (
      <UniversalLayout>
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4 animate-bounce-in">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                  <Receipt className="w-full h-full text-red-400" />
                </div>
              </div>
              <h1 className="text-5xl font-bold charnoks-text animate-slide-in-left">
                Record Expense
              </h1>
              <p className="text-xl text-white font-medium animate-slide-in-right">
                Track and categorize your business expenses
              </p>
            </div>

            {/* Record Expense Component */}
            <div className="animate-slide-in-left delay-300">
              <RecordExpense />
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
                <TrendingDown className="w-full h-full text-orange-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold charnoks-text animate-slide-in-left">
              Expenses Management
            </h1>
            <p className="text-xl text-white font-medium animate-slide-in-right">
              Monitor and analyze your restaurant's business expenses
            </p>
          </div>

          {/* Expenses History */}
          <div className="animate-slide-in-right delay-300">
            <ExpensesHistory />
          </div>
        </div>
      </div>
    </UniversalLayout>
  );
};