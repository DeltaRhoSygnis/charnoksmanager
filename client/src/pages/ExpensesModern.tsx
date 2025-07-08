import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, Plus, Calendar, Filter, Receipt, DollarSign, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const ExpensesModern = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Get expenses data
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['/api/expenses'],
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (!response.ok) throw new Error('Failed to add expense');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      toast({ title: 'Expense recorded successfully!' });
      setShowAddExpense(false);
    },
  });

  const todayExpenses = expenses.filter((expense: any) => {
    const today = new Date().toDateString();
    const expenseDate = new Date(expense.createdAt).toDateString();
    return today === expenseDate;
  });

  const totalToday = todayExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
  const totalMonth = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);

  const expenseCategories = ['Food Supplies', 'Equipment', 'Utilities', 'Marketing', 'Staff', 'Other'];

  return (
    <div className="modern-app-container">
      {/* Modern App Header */}
      <div className="modern-app-header">
        <div className="modern-app-title">
          💸 Expense Tracker
        </div>
        <div className="modern-app-subtitle">
          Monitor your business spending
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {/* Quick Stats */}
        <div className="modern-stats-grid">
          <div className="modern-stats-card">
            <div className="modern-stats-icon">💸</div>
            <div className="modern-stats-value">${totalToday.toFixed(2)}</div>
            <div className="modern-stats-label">Today's Expenses</div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">📊</div>
            <div className="modern-stats-value">{todayExpenses.length}</div>
            <div className="modern-stats-label">Today's Transactions</div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">📅</div>
            <div className="modern-stats-value">${totalMonth.toFixed(2)}</div>
            <div className="modern-stats-label">Total This Month</div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">📈</div>
            <div className="modern-stats-value">{expenses.length}</div>
            <div className="modern-stats-label">Total Expenses</div>
          </div>
        </div>

        {/* Quick Add Expense */}
        <div className="modern-section">
          <div className="modern-section-title">Quick Actions</div>
          <Button 
            onClick={() => setShowAddExpense(true)}
            className="modern-btn-primary w-full"
          >
            <Plus size={16} className="mr-2" />
            Record New Expense
          </Button>
        </div>

        {/* Expense Categories */}
        <div className="modern-section">
          <div className="modern-section-title">Expense Categories</div>
          <div className="modern-category-grid">
            {expenseCategories.map((category) => {
              const categoryExpenses = expenses.filter((e: any) => e.category === category);
              const categoryTotal = categoryExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
              return (
                <div key={category} className="modern-category-card">
                  <div className="modern-category-name">{category}</div>
                  <div className="modern-category-amount">${categoryTotal.toFixed(2)}</div>
                  <div className="modern-category-count">{categoryExpenses.length} expenses</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="modern-section">
          <div className="modern-section-title">
            Recent Expenses ({expenses.length})
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="modern-loading-skeleton">
                {[1, 2, 3].map(i => (
                  <div key={i} className="modern-skeleton-card" />
                ))}
              </div>
            ) : expenses.length > 0 ? (
              expenses.slice(0, 10).map((expense: any) => (
                <div key={expense.id} className="modern-expense-card">
                  <div className="modern-expense-icon">
                    <Receipt size={16} />
                  </div>
                  <div className="modern-expense-info">
                    <div className="modern-expense-title">{expense.description}</div>
                    <div className="modern-expense-details">
                      <span className="modern-expense-category">{expense.category}</span>
                      <span className="modern-expense-separator">•</span>
                      <span className="modern-expense-date">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </span>
                      <span className="modern-expense-separator">•</span>
                      <span className="modern-expense-worker">{expense.workerName}</span>
                    </div>
                  </div>
                  <div className="modern-expense-amount">
                    ${expense.amount.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="modern-empty-state">
                <div className="modern-empty-icon">💸</div>
                <div className="modern-empty-title">No expenses recorded</div>
                <div className="modern-empty-subtitle">Start tracking your business expenses</div>
                <Button 
                  onClick={() => setShowAddExpense(true)}
                  className="modern-btn-primary mt-4"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Expense
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Expense Insights */}
        <div className="modern-section">
          <div className="modern-section-title">Spending Insights</div>
          <div className="space-y-3">
            <div className="modern-insight-card modern-insight-info">
              <div className="modern-insight-icon">📊</div>
              <div className="modern-insight-content">
                <div className="modern-insight-title">Top expense category</div>
                <div className="modern-insight-description">
                  Food Supplies accounts for 45% of your monthly spending
                </div>
              </div>
            </div>
            <div className="modern-insight-card modern-insight-warning">
              <div className="modern-insight-icon">⚠️</div>
              <div className="modern-insight-content">
                <div className="modern-insight-title">Budget alert</div>
                <div className="modern-insight-description">
                  You're 80% through your monthly equipment budget
                </div>
              </div>
            </div>
            <div className="modern-insight-card modern-insight-positive">
              <div className="modern-insight-icon">💡</div>
              <div className="modern-insight-content">
                <div className="modern-insight-title">Savings opportunity</div>
                <div className="modern-insight-description">
                  Consider bulk purchasing for supplies to reduce costs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal 
          onClose={() => setShowAddExpense(false)}
          onAdd={(data) => addExpenseMutation.mutate({
            ...data,
            workerId: user?.uid,
            workerName: user?.email,
          })}
          categories={expenseCategories}
        />
      )}
    </div>
  );
};

// Add Expense Modal Component
const AddExpenseModal = ({ onClose, onAdd, categories }: any) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal">
        <div className="modern-modal-header">
          <h3 className="modern-modal-title">Record New Expense</h3>
          <Button variant="ghost" onClick={onClose} className="modern-modal-close">
            ×
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="modern-modal-content">
          <div className="space-y-4">
            <div>
              <label className="modern-label">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="modern-input"
                placeholder="What was this expense for?"
                required
              />
            </div>
            <div>
              <label className="modern-label">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="modern-input pl-10"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <label className="modern-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="modern-input"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modern-modal-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="modern-btn-primary">
              Record Expense
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};