import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, Users, TrendingUp, Plus, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { Sale } from '@/types/sales';
import { CreateWorkerAccount } from '@/components/worker/CreateWorkerAccount';

interface Transaction {
  id: string;
  type: 'sale' | 'expense';
  amount: number;
  description?: string;
  workerEmail?: string;
  timestamp: Date;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    totalWorkers: 0,
    todaysRevenue: 0
  });
  const [showCreateWorker, setShowCreateWorker] = useState(false);

  useEffect(() => {
    fetchTransactions();
    calculateStats();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Fetch recent sales
      const salesQuery = query(
        collection(db, 'sales'),
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
          workerEmail: data.workerEmail,
          items: data.items,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });

      // Fetch recent expenses
      const expensesQuery = query(
        collection(db, 'expenses'),
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
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateStats = async () => {
    try {
      // Calculate total sales
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const totalSales = salesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
      
      // Calculate total expenses
      const expensesSnapshot = await getDocs(collection(db, 'expenses'));
      const totalExpenses = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      
      // Calculate workers count
      const workersQuery = query(collection(db, 'users'), where('role', '==', 'worker'));
      const workersSnapshot = await getDocs(workersQuery);
      const totalWorkers = workersSnapshot.size;

      // Calculate today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysRevenue = salesSnapshot.docs
        .filter(doc => {
          const saleDate = doc.data().timestamp?.toDate() || new Date();
          return saleDate >= today;
        })
        .reduce((sum, doc) => sum + (doc.data().total || 0), 0);

      setStats({
        totalSales,
        totalExpenses,
        totalWorkers,
        todaysRevenue
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Owner Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">Manage your business</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateWorker(true)}
                  className="bg-white/50 hover:bg-white/80"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
                <Button variant="outline" onClick={logout} className="bg-white/50 hover:bg-white/80">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-green-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{stats.totalSales.toFixed(2)}</div>
                <p className="text-xs text-green-100">All time revenue</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-100">Total Expenses</CardTitle>
                <Receipt className="h-4 w-4 text-red-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{stats.totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-red-100">All expenses</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Workers</CardTitle>
                <Users className="h-4 w-4 text-blue-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalWorkers}</div>
                <p className="text-xs text-blue-100">Active workers</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Today's Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{stats.todaysRevenue.toFixed(2)}</div>
                <p className="text-xs text-purple-100">Sales today</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Latest sales and expenses from your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No transactions recorded yet</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/50 border border-white/20 rounded-lg hover:bg-white/70 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === 'sale' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">
                            {transaction.type === 'sale' ? 'Sale' : 'Expense'}
                            {transaction.workerEmail && (
                              <span className="text-sm text-gray-500 ml-2">by {transaction.workerEmail}</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.description || 
                              (transaction.items && `${transaction.items.length} item(s)`) || 
                              'Transaction'
                            } • {format(transaction.timestamp, 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'sale' ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                        </p>
                        <Badge variant={transaction.type === 'sale' ? 'default' : 'secondary'}>
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

      {/* Create Worker Modal */}
      {showCreateWorker && (
        <CreateWorkerAccount onClose={() => setShowCreateWorker(false)} />
      )}
    </>
  );
};
