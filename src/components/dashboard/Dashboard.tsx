
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface Sale {
  id: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  timestamp: Date;
}

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    todaysSales: 0,
    recentTransactions: 0
  });

  useEffect(() => {
    fetchRecentSales();
    calculateStats();
  }, []);

  const fetchRecentSales = async () => {
    try {
      const salesQuery = query(
        collection(db, 'sales'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(salesQuery);
      const sales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Sale[];
      setRecentSales(sales);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const calculateStats = async () => {
    try {
      // Calculate total sales
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const totalSales = salesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
      
      // Calculate products count
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const totalProducts = productsSnapshot.size;

      // Calculate today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysSales = salesSnapshot.docs
        .filter(doc => {
          const saleDate = doc.data().timestamp?.toDate() || new Date();
          return saleDate >= today;
        })
        .reduce((sum, doc) => sum + (doc.data().total || 0), 0);

      setStats({
        totalSales,
        totalProducts,
        todaysSales,
        recentTransactions: salesSnapshot.size
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Sari POS Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{stats.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Total inventory items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{stats.todaysSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Sales for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentTransactions}</div>
              <p className="text-xs text-muted-foreground">Total transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sales recorded yet</p>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">₱{sale.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {sale.items.length} item(s) • {format(sale.timestamp, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
