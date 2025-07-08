import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, BarChart3, Package, Users, Star, Sparkles, TrendingUp, DollarSign, Clock, Zap, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const HomeModern = () => {
  const { user } = useAuth();

  // Get analytics data
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/summary'],
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/analytics/transactions'],
    enabled: !!user,
  });

  return (
    <div className="modern-app-container">
      {/* Modern App Header */}
      <div className="modern-app-header">
        <div className="modern-app-title">
          🌟 Charnoks Dashboard
        </div>
        <div className="modern-app-subtitle">
          Welcome back, {user?.email?.split('@')[0]}!
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {user?.role === "owner" ? (
          <ModernOwnerDashboard analytics={analytics} transactions={transactions} />
        ) : (
          <ModernWorkerDashboard analytics={analytics} />
        )}
      </div>
    </div>
  );
};

const ModernOwnerDashboard = ({ analytics, transactions }: any) => {
  const todaySales = analytics?.totalSales || 0;
  const todayTransactions = transactions?.length || 0;
  const todayExpenses = analytics?.totalExpenses || 0;
  const netProfit = todaySales - todayExpenses;

  return (
    <div className="space-y-4">
      {/* Quick Stats Grid */}
      <div className="modern-stats-grid">
        <div className="modern-stats-card">
          <div className="modern-stats-icon">💰</div>
          <div className="modern-stats-value">${todaySales.toFixed(2)}</div>
          <div className="modern-stats-label">Today's Sales</div>
        </div>
        <div className="modern-stats-card">
          <div className="modern-stats-icon">🧾</div>
          <div className="modern-stats-value">{todayTransactions}</div>
          <div className="modern-stats-label">Transactions</div>
        </div>
        <div className="modern-stats-card">
          <div className="modern-stats-icon">📊</div>
          <div className="modern-stats-value">${netProfit.toFixed(2)}</div>
          <div className="modern-stats-label">Net Profit</div>
        </div>
        <div className="modern-stats-card">
          <div className="modern-stats-icon">💸</div>
          <div className="modern-stats-value">${todayExpenses.toFixed(2)}</div>
          <div className="modern-stats-label">Expenses</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="modern-section">
        <div className="modern-section-title">Quick Actions</div>
        <div className="modern-action-grid">
          <Link to="/sales" className="modern-action-card">
            <div className="modern-action-icon">🛒</div>
            <div className="modern-action-title">Record Sale</div>
            <div className="modern-action-subtitle">Process new transaction</div>
            <ArrowRight className="modern-action-arrow" size={16} />
          </Link>
          
          <Link to="/products" className="modern-action-card">
            <div className="modern-action-icon">📦</div>
            <div className="modern-action-title">Manage Products</div>
            <div className="modern-action-subtitle">Add or edit inventory</div>
            <ArrowRight className="modern-action-arrow" size={16} />
          </Link>
          
          <Link to="/analysis" className="modern-action-card">
            <div className="modern-action-icon">📈</div>
            <div className="modern-action-title">View Analytics</div>
            <div className="modern-action-subtitle">Business insights</div>
            <ArrowRight className="modern-action-arrow" size={16} />
          </Link>
          
          <Link to="/expenses" className="modern-action-card">
            <div className="modern-action-icon">💳</div>
            <div className="modern-action-title">Track Expenses</div>
            <div className="modern-action-subtitle">Record business costs</div>
            <ArrowRight className="modern-action-arrow" size={16} />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="modern-section">
        <div className="modern-section-title">Recent Activity</div>
        <div className="modern-activity-list">
          {transactions?.slice(0, 3).map((transaction: any, index: number) => (
            <div key={index} className="modern-activity-item">
              <div className="modern-activity-icon">🛒</div>
              <div className="modern-activity-content">
                <div className="modern-activity-title">Sale Transaction</div>
                <div className="modern-activity-subtitle">${transaction.amount}</div>
              </div>
              <div className="modern-activity-time">
                {new Date(transaction.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {(!transactions || transactions.length === 0) && (
            <div className="modern-empty-state">
              <div className="modern-empty-icon">📭</div>
              <div className="modern-empty-title">No recent activity</div>
              <div className="modern-empty-subtitle">Start by recording your first sale!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ModernWorkerDashboard = ({ analytics }: any) => {
  const todaySales = analytics?.totalSales || 0;
  const todayTransactions = analytics?.totalTransactions || 0;

  return (
    <div className="space-y-4">
      {/* Worker Stats */}
      <div className="modern-stats-grid">
        <div className="modern-stats-card">
          <div className="modern-stats-icon">💰</div>
          <div className="modern-stats-value">${todaySales.toFixed(2)}</div>
          <div className="modern-stats-label">My Sales Today</div>
        </div>
        <div className="modern-stats-card">
          <div className="modern-stats-icon">🧾</div>
          <div className="modern-stats-value">{todayTransactions}</div>
          <div className="modern-stats-label">My Transactions</div>
        </div>
      </div>

      {/* Worker Actions */}
      <div className="modern-section">
        <div className="modern-section-title">My Tasks</div>
        <div className="modern-action-grid">
          <Link to="/sales" className="modern-action-card">
            <div className="modern-action-icon">🛒</div>
            <div className="modern-action-title">Record Sale</div>
            <div className="modern-action-subtitle">Process customer transaction</div>
            <ArrowRight className="modern-action-arrow" size={16} />
          </Link>
          
          <Link to="/expenses" className="modern-action-card">
            <div className="modern-action-icon">💸</div>
            <div className="modern-action-title">Log Expense</div>
            <div className="modern-action-subtitle">Record business expense</div>
            <ArrowRight className="modern-action-arrow" size={16} />
          </Link>
        </div>
      </div>

      {/* Worker Performance */}
      <div className="modern-section">
        <div className="modern-section-title">Today's Performance</div>
        <div className="modern-performance-card">
          <div className="modern-performance-header">
            <div className="modern-performance-title">Sales Target</div>
            <div className="modern-performance-value">${todaySales.toFixed(2)} / $500</div>
          </div>
          <div className="modern-performance-bar">
            <div 
              className="modern-performance-progress" 
              style={{ width: `${Math.min((todaySales / 500) * 100, 100)}%` }}
            />
          </div>
          <div className="modern-performance-subtitle">
            {((todaySales / 500) * 100).toFixed(0)}% of daily target
          </div>
        </div>
      </div>
    </div>
  );
};