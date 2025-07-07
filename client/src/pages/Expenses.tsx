import { useAuth } from '@/hooks/useAuth';
import { RecordExpense } from '@/components/expenses/RecordExpense';
import { ExpensesHistory } from '@/components/expenses/ExpensesHistory';
import { OptimizedLayout } from '@/components/layout/OptimizedLayout';
import { Receipt, DollarSign, TrendingDown } from 'lucide-react';

export const Expenses = () => {
  const { user } = useAuth();

  if (user?.role === 'worker') {
    return (
      <OptimizedLayout>
        <div className="min-h-screen p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4 animate-bounce-in">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                  <Receipt className="w-full h-full text-red-400" />
                </div>
              </div>
              <h1 className="text-responsive-2xl font-bold charnoks-text animate-slide-in-left card-title">
                Record Expense
              </h1>
              <p className="text-responsive-base text-white font-medium animate-slide-in-right card-text-base">
                Track and categorize your business expenses
              </p>
            </div>

            {/* Record Expense Component */}
            <div className="animate-slide-in-left delay-300">
              <RecordExpense />
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
              <div className="w-12 h-12 md:w-16 md:h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                <TrendingDown className="w-full h-full text-orange-400" />
              </div>
            </div>
            <h1 className="text-responsive-2xl font-bold charnoks-text animate-slide-in-left card-title">
              Expenses Management
            </h1>
            <p className="text-responsive-base text-white font-medium animate-slide-in-right card-text-base">
              Monitor and analyze your restaurant's business expenses
            </p>
          </div>

          {/* Expenses History */}
          <div className="animate-slide-in-right delay-300">
            <ExpensesHistory />
          </div>
        </div>
      </div>
    </OptimizedLayout>
  );
};