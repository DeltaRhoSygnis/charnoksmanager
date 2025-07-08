
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, BarChart3, Package, Users, Star, Sparkles, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedLayout } from '@/components/layout/OptimizedLayout';

const charnofsLogo = "/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png";

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="modern-app-container">
      {/* Modern App Header */}
      <div className="modern-app-header">
        <div className="modern-app-title">
          🌟 Charnoks POS
        </div>
        <div className="modern-app-subtitle">
          Welcome back, {user?.email?.split('@')[0]}!
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {user?.role === "owner" ? <ModernOwnerDashboard /> : <ModernWorkerDashboard />}
      </div>
    </div>
  );
};

const ModernOwnerDashboard = () => {
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="modern-stats-grid">
        <div className="modern-stats-card">
          <div className="modern-stats-value">$2,847</div>
          <div className="modern-stats-label">Today's Sales</div>
        </div>
        <div className="modern-stats-card">
          <div className="modern-stats-value">156</div>
          <div className="modern-stats-label">Transactions</div>
        </div>
        <div className="modern-stats-card">
          <div className="modern-stats-value">23</div>
          <div className="modern-stats-label">Products</div>
        </div>
        <div className="modern-stats-card">
          <div className="modern-stats-value">5</div>
          <div className="modern-stats-label">Workers</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="modern-card-icon">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="modern-card-title">Quick Actions</div>
            <div className="modern-card-subtitle">Manage your business efficiently</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/sales">
            <button className="modern-btn text-sm w-full">
              <ShoppingCart className="w-4 h-4 mr-2" />
              New Sale
            </button>
          </Link>
          <Link to="/products">
            <button className="modern-btn-secondary text-sm w-full">
              <Package className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </Link>
          <Link to="/settings">
            <button className="modern-btn-secondary text-sm w-full">
              <Users className="w-4 h-4 mr-2" />
              Add Worker
            </button>
          </Link>
          <Link to="/analysis">
            <button className="modern-btn text-sm w-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Reports
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="modern-card-icon">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="modern-card-title">Recent Activity</div>
            <div className="modern-card-subtitle">Latest transactions and updates</div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Sale #00{item}</div>
                  <div className="text-xs text-gray-500">2 minutes ago</div>
                </div>
              </div>
              <div className="modern-badge">
                $45.00
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ModernWorkerDashboard = () => {
  return (
    <div className="space-y-4">
      {/* Today's Performance */}
      <div className="modern-stats-grid">
        <div className="modern-stats-card">
          <div className="modern-stats-value">$456</div>
          <div className="modern-stats-label">Your Sales</div>
        </div>
        <div className="modern-stats-card">
          <div className="modern-stats-value">12</div>
          <div className="modern-stats-label">Transactions</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="modern-card-icon">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="modern-card-title">Quick Sale</div>
            <div className="modern-card-subtitle">Record a new transaction</div>
          </div>
        </div>
        <Link to="/sales">
          <button className="modern-btn w-full">
            <Zap className="w-4 h-4 mr-2" />
            Start New Sale
          </button>
        </Link>
      </div>

      {/* Record Expense */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="modern-card-icon">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="modern-card-title">Record Expense</div>
            <div className="modern-card-subtitle">Track business expenses</div>
          </div>
        </div>
        <Link to="/expenses">
          <button className="modern-btn-secondary w-full">
            Add Expense
          </button>
        </Link>
      </div>

      {/* Recent Sales */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="modern-card-icon">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="modern-card-title">Your Recent Sales</div>
            <div className="modern-card-subtitle">Today's transaction history</div>
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="text-sm">Chicken Meal #{item}</div>
              <div className="modern-badge-orange">
                $15.00
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
