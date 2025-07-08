import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Calendar, Users, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AnalysisModern = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [viewMode, setViewMode] = useState('overview');

  // Get analytics data
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/analytics/transactions'],
  });

  const todaySales = analytics?.totalSales || 0;
  const todayTransactions = transactions?.length || 0;
  const todayExpenses = analytics?.totalExpenses || 0;
  const netProfit = todaySales - todayExpenses;

  return (
    <div className="modern-app-container">
      {/* Modern App Header */}
      <div className="modern-app-header">
        <div className="modern-app-title">
          📊 Business Analytics
        </div>
        <div className="modern-app-subtitle">
          Track your performance and insights
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {/* Time Range Selector */}
        <div className="modern-section">
          <div className="modern-time-selector">
            {['today', 'week', 'month', 'year'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "modern-btn-primary-small" : "modern-btn-outline-small"}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="modern-stats-grid">
          <div className="modern-stats-card">
            <div className="modern-stats-icon">💰</div>
            <div className="modern-stats-value">${todaySales.toFixed(2)}</div>
            <div className="modern-stats-label">Total Revenue</div>
            <div className="modern-stats-trend modern-stats-trend-up">
              <ArrowUp size={12} />
              +12.5%
            </div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">🧾</div>
            <div className="modern-stats-value">{todayTransactions}</div>
            <div className="modern-stats-label">Transactions</div>
            <div className="modern-stats-trend modern-stats-trend-up">
              <ArrowUp size={12} />
              +8.3%
            </div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">📈</div>
            <div className="modern-stats-value">${netProfit.toFixed(2)}</div>
            <div className="modern-stats-label">Net Profit</div>
            <div className="modern-stats-trend modern-stats-trend-up">
              <ArrowUp size={12} />
              +15.2%
            </div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">💸</div>
            <div className="modern-stats-value">${todayExpenses.toFixed(2)}</div>
            <div className="modern-stats-label">Expenses</div>
            <div className="modern-stats-trend modern-stats-trend-down">
              <ArrowDown size={12} />
              -5.1%
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="modern-section">
          <div className="modern-view-selector">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'sales', label: 'Sales', icon: '💰' },
              { id: 'products', label: 'Products', icon: '📦' },
              { id: 'workers', label: 'Workers', icon: '👥' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`modern-view-option ${viewMode === mode.id ? 'active' : ''}`}
              >
                <span className="modern-view-icon">{mode.icon}</span>
                <span className="modern-view-label">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="modern-section">
          <div className="modern-section-title">Performance Charts</div>
          <div className="modern-chart-container">
            <div className="modern-chart-placeholder">
              <BarChart3 size={48} className="modern-chart-icon" />
              <div className="modern-chart-title">Sales Performance</div>
              <div className="modern-chart-subtitle">
                Daily sales trend for {timeRange}
              </div>
              <div className="modern-chart-mock-bars">
                {[65, 85, 75, 95, 80, 90, 70].map((height, i) => (
                  <div 
                    key={i} 
                    className="modern-chart-bar" 
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="modern-section">
          <div className="modern-section-title">Top Performing Products</div>
          <div className="space-y-3">
            {[
              { name: 'Special Fried Chicken', sales: '$1,234', percentage: 85 },
              { name: 'Chicken Wings', sales: '$856', percentage: 65 },
              { name: 'French Fries', sales: '$645', percentage: 45 },
              { name: 'Soft Drinks', sales: '$423', percentage: 35 },
            ].map((product, index) => (
              <div key={index} className="modern-product-performance">
                <div className="modern-product-performance-info">
                  <div className="modern-product-performance-name">{product.name}</div>
                  <div className="modern-product-performance-sales">{product.sales}</div>
                </div>
                <div className="modern-product-performance-bar">
                  <div 
                    className="modern-product-performance-progress" 
                    style={{ width: `${product.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Insights */}
        <div className="modern-section">
          <div className="modern-section-title">Business Insights</div>
          <div className="space-y-3">
            <div className="modern-insight-card modern-insight-positive">
              <div className="modern-insight-icon">📈</div>
              <div className="modern-insight-content">
                <div className="modern-insight-title">Sales are trending up</div>
                <div className="modern-insight-description">
                  You're averaging 15% more sales this week compared to last week
                </div>
              </div>
            </div>
            <div className="modern-insight-card modern-insight-warning">
              <div className="modern-insight-icon">⚠️</div>
              <div className="modern-insight-content">
                <div className="modern-insight-title">Peak hour opportunity</div>
                <div className="modern-insight-description">
                  Consider adding more staff during 12-2 PM for maximum efficiency
                </div>
              </div>
            </div>
            <div className="modern-insight-card modern-insight-info">
              <div className="modern-insight-icon">💡</div>
              <div className="modern-insight-content">
                <div className="modern-insight-title">Popular combo suggestion</div>
                <div className="modern-insight-description">
                  Customers often buy chicken with fries - consider bundle pricing
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="modern-section">
          <div className="modern-section-title">Quick Reports</div>
          <div className="modern-action-grid">
            <div className="modern-action-card">
              <div className="modern-action-icon">📊</div>
              <div className="modern-action-title">Export Sales</div>
              <div className="modern-action-subtitle">Download CSV report</div>
            </div>
            <div className="modern-action-card">
              <div className="modern-action-icon">👥</div>
              <div className="modern-action-title">Worker Report</div>
              <div className="modern-action-subtitle">Performance summary</div>
            </div>
            <div className="modern-action-card">
              <div className="modern-action-icon">📦</div>
              <div className="modern-action-title">Inventory Report</div>
              <div className="modern-action-subtitle">Stock analysis</div>
            </div>
            <div className="modern-action-card">
              <div className="modern-action-icon">💰</div>
              <div className="modern-action-title">Financial Report</div>
              <div className="modern-action-subtitle">Profit & loss</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};