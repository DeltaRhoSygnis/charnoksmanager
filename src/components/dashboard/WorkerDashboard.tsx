
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Receipt, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface WorkerTransaction {
  id: string;
  type: 'sale' | 'expense';
  amount: number;
  description?: string;
  timestamp: Date;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<WorkerTransaction[]>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayExpenses: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    fetchWorkerTransactions();
    calculateWorkerStats();
  }, [user]);

  const fetchWorkerTransactions = async () => {
    if (!user) return;

    try {
      // Fetch worker's sales
      const salesQuery = query(
        collection(db, 'sales'),
        where('workerEmail', '==', user.email),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'sale' as const,
          amount: data.total,
          items: data.items,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });

      // Fetch worker's expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('workerEmail', '==', user.email),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = expensesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'expense' as const,
          amount: data.amount,
          description: data.description,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });

      const allTransactions = [...sales, ...expenses]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching worker transactions:', error);
    }
  };

  const calculateWorkerStats = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate today's sales
      const salesQuery = query(
        collection(db, 'sales'),
        where('workerEmail', '==', user.email),
        where('timestamp', '>=', today)
      );
      const salesSnapshot = await getDocs(salesQuery);
      const todaySales = salesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);

      // Calculate today's expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('workerEmail', '==', user.email),
        where('timestamp', '>=', today)
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const todayExpenses = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

      // Total transactions count
      const totalTransactions = salesSnapshot.size + expensesSnapshot.size;

      setStats({
        todaySales,
        todayExpenses,
        totalTransactions
      });
    } catch (error) {
      console.error('Error calculating worker stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <img 
                  src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
                  alt="Charnoks" 
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Charnoks POS
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">Worker Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 rounded-xl shadow-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
              </div>
              <Button variant="outline" onClick={logout} className="bg-white/70 hover:bg-white shadow-sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/sales">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-3">Record Sale</h3>
                    <p className="text-blue-100">Add new sales transactions</p>
                  </div>
                  <ShoppingCart className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/expenses">
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-3">Record Expense</h3>
                    <p className="text-orange-100">Add business expenses</p>
                  </div>
                  <Receipt className="h-12 w-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₱{stats.todaySales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Sales recorded today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">₱{stats.todayExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Expenses recorded today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">Today's transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
            <CardTitle className="text-xl">My Recent Transactions</CardTitle>
            <CardDescription className="text-orange-100">Your latest sales and expenses</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No transactions recorded yet</p>
                  <p className="text-gray-400">Start by recording your first sale or expense</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-orange-50 border border-orange-100 rounded-xl hover:from-orange-50 hover:to-orange-100 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        transaction.type === 'sale' ? 'bg-green-500 shadow-green-200 shadow-lg' : 'bg-red-500 shadow-red-200 shadow-lg'
                      }`}></div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {transaction.type === 'sale' ? 'Sale' : 'Expense'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.description || 
                            (transaction.items && `${transaction.items.length} item(s)`) || 
                            'Transaction'
                          } • {format(transaction.timestamp, 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'sale' ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                      </p>
                      <Badge variant={transaction.type === 'sale' ? 'default' : 'secondary'} className="shadow-sm">
                        {transaction.type}
                      </Badge>
                    </div>
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
