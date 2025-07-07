import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OfflineState } from "@/lib/offlineState";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { Button } from "@/components/ui/button";
import { FirebaseTestButton } from "@/components/ui/firebase-test-button";
import { TransactionHistory } from "@/components/reports/TransactionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Plus,
  Receipt,
  ShoppingCart,
  Sparkles,
  Stars,
  Menu,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Home,
  Settings,
  CreditCard,
  History,
} from "lucide-react";
import { LineChart as RechartsLine, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Link } from "react-router-dom";
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";
import { Sale } from "@/types/sales";
import { CreateWorkerAccount } from "@/components/worker/CreateWorkerAccount";
import charnofsLogo from "@assets/IMG_20250703_110727_1751555868705.png";

interface Transaction {
  id: string;
  type: "sale" | "expense";
  amount: number;
  description?: string;
  workerEmail?: string;
  timestamp: Date;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    totalWorkers: 0,
    todaysRevenue: 0,
  });
  const [showCreateWorker, setShowCreateWorker] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user && user.uid) {
      fetchTransactions();
      calculateStats();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user || !user.uid) {
      console.log("User not authenticated, skipping transaction fetch");
      return;
    }

    try {
      // Use DataService to get real database data
      const { DataService } = await import("@/lib/dataService");
      const allTransactions = await DataService.getTransactions();
      
      // Convert to dashboard format and take recent 10
      const dashboardTransactions = allTransactions
        .slice(0, 10)
        .map((t) => ({
          id: t.id,
          type: (t.type || "sale") as "sale" | "expense",
          amount: t.totalAmount || t.amount || 0,
          workerEmail: t.workerEmail,
          items: t.items?.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price
          })) || [],
          timestamp: t.timestamp,
        }));
      
      setTransactions(dashboardTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      // Fallback to empty array instead of demo data
      setTransactions([]);
    }

    try {
      if (OfflineState.hasFirebaseAccess()) {
        // Fetch recent sales
        const salesQuery = query(
          collection(db, "sales"),
          orderBy("timestamp", "desc"),
          limit(10),
        );
        const salesSnapshot = await getDocs(salesQuery);
        const sales = salesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: "sale" as const,
            amount: data.total || 0,
            workerEmail: data.workerEmail,
            items: data.items || [],
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        // Fetch recent expenses
        const expensesQuery = query(
          collection(db, "expenses"),
          orderBy("timestamp", "desc"),
          limit(10),
        );
        const expensesSnapshot = await getDocs(expensesQuery);
        const expenses = expensesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: "expense" as const,
            amount: data.amount,
            description: data.description,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        const allTransactions = [...sales, ...expenses]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        setTransactions(allTransactions);
      } else {
        // Firebase not available - no transactions to show
        setTransactions([]);
      }
    } catch (error: any) {
      console.error("Error fetching transactions:", error);

      if (OfflineState.isNetworkError(error)) {
        // Fallback to local storage
        const localTransactions = LocalStorageDB.getTransactions()
          .slice(0, 10)
          .map((t) => ({
            id: t.id,
            type: "sale" as const,
            amount: t.totalAmount || 0,
            workerEmail: t.workerEmail,
            items: t.items?.map(item => ({
              name: item.productName,
              quantity: item.quantity,
              price: item.price
            })) || [],
            timestamp: t.timestamp,
          }));
        setTransactions(localTransactions);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const calculateStats = async () => {
    if (!user || !user.uid) {
      console.log("User not authenticated, skipping stats calculation");
      return;
    }

    try {
      // Use DataService to get real database data
      const { DataService } = await import("@/lib/dataService");
      const allTransactions = await DataService.getTransactions();
      
      // Calculate real stats from database
      let totalSales = 0;
      let totalExpenses = 0;
      let todaysRevenue = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      allTransactions.forEach(transaction => {
        const amount = transaction.totalAmount || transaction.amount || 0;
        
        if (transaction.type === 'sale') {
          totalSales += amount;
          
          // Check if transaction is from today
          const transactionDate = new Date(transaction.timestamp);
          transactionDate.setHours(0, 0, 0, 0);
          if (transactionDate.getTime() === today.getTime()) {
            todaysRevenue += amount;
          }
        } else if (transaction.type === 'expense') {
          totalExpenses += amount;
        }
      });
      
      // Count unique workers
      const uniqueWorkers = new Set(
        allTransactions.map(t => t.workerId).filter(Boolean)
      );
      
      setStats({
        totalSales,
        totalExpenses,
        totalWorkers: uniqueWorkers.size,
        todaysRevenue,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
      // Set empty stats instead of demo data
      setStats({
        totalSales: 0,
        totalExpenses: 0,
        totalWorkers: 0,
        todaysRevenue: 0,
      });
    }

    try {
      if (OfflineState.hasFirebaseAccess()) {
        // Calculate total sales
        const salesSnapshot = await getDocs(collection(db, "sales"));
        const totalSales = salesSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().total || 0),
          0,
        );

        // Calculate total expenses
        const expensesSnapshot = await getDocs(collection(db, "expenses"));
        const totalExpenses = expensesSnapshot.docs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0,
        );

        // Calculate workers count
        const workersQuery = query(
          collection(db, "users"),
          where("role", "==", "worker"),
        );
        const workersSnapshot = await getDocs(workersQuery);
        const totalWorkers = workersSnapshot.size;

        // Calculate today's revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysRevenue = salesSnapshot.docs
          .filter((doc) => {
            const saleDate = doc.data().timestamp?.toDate() || new Date();
            return saleDate >= today;
          })
          .reduce((sum, doc) => sum + (doc.data().total || 0), 0);

        setStats({
          totalSales,
          totalExpenses,
          totalWorkers,
          todaysRevenue,
        });
      } else {
        // Firebase not available - show zero stats
        setStats({
          totalSales: 0,
          totalExpenses: 0,
          totalWorkers: 0,
          todaysRevenue: 0,
        });
      }
    } catch (error: any) {
      console.error("Error calculating stats:", error);

      if (OfflineState.isNetworkError(error)) {
        // Firebase error - show zero stats
        setStats({
          totalSales: 0,
          totalExpenses: 0,
          totalWorkers: 0,
          todaysRevenue: 0,
        });
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const MobileLayout = () => (
    <div className="min-h-screen w-full galaxy-animated cosmic-overlay">
      {/* Mobile Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-slide-in-left">
              <div className="w-16 h-16 bg-black/20 rounded-2xl p-2 border border-white/20">
                <img 
                  src={charnofsLogo} 
                  alt="Charnoks Special Fried Chicken" 
                  className="w-full h-full object-contain animate-pulse-glow"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold charnoks-text">
                  Charnoks
                </h1>
                <p className="text-sm text-white font-medium">Owner Dashboard</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
              <Activity className="h-4 w-4 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* 2x2 Grid Cards - Reference Layout */}
        <div className="grid grid-cols-2 gap-4 animate-bounce-in animation-resistant">
          {/* Total Sales */}
          <Card className="card-reference text-white aspect-square hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="text-left space-y-2">
                <p className="reference-title text-solid opacity-80">Total</p>
                <p className="reference-title text-solid opacity-80">Sales 📈</p>
                <p className="reference-value text-solid mt-4">₱{stats.totalSales.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="card-reference text-white aspect-square hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="text-left space-y-2">
                <p className="reference-title text-solid opacity-80">Total</p>
                <p className="reference-title text-solid opacity-80">Expenses 📊</p>
                <p className="reference-value text-solid mt-4">₱{stats.totalExpenses.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Net Profit */}
          <Card className="card-reference text-white aspect-square hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="text-left space-y-2">
                <p className="reference-title text-solid opacity-80">Net Profit 📊</p>
                <p className="reference-value text-solid mt-4">₱{(stats.totalSales - stats.totalExpenses).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Revenue */}
          <Card className="card-reference text-white aspect-square hover:scale-105 transition-transform duration-300">
            <CardContent className="p-6 h-full flex flex-col justify-center">
              <div className="text-left space-y-2">
                <p className="reference-title text-solid opacity-80">Today's</p>
                <p className="reference-title text-solid opacity-80">Revenue 💰</p>
                <p className="reference-value text-solid mt-4">₱0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Performance Chart - Reference Style */}
        <div className="animate-bounce-in animation-resistant delay-200">
          <Card className="card-reference text-white">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="reference-title text-solid opacity-80">📊 Weekly Performance</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'white', fontSize: 12 }}
                    />
                    <YAxis hide />
                    <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="reference-title text-solid opacity-80">Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="reference-title text-solid opacity-80">Expenses</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-xl border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Mobile Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="text-center">
                    <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-green-400">₱{stats.totalSales.toLocaleString()}</p>
                    <p className="text-xs text-blue-200">Total Sales</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Receipt className="h-6 w-6 text-red-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-red-400">₱{stats.totalExpenses.toLocaleString()}</p>
                    <p className="text-xs text-blue-200">Total Expenses</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-blue-400">{stats.totalWorkers}</p>
                    <p className="text-xs text-blue-200">Workers</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                <CardContent className="p-4">
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-purple-400">₱{stats.todaysRevenue.toLocaleString()}</p>
                    <p className="text-xs text-blue-200">Today's Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Charts - Trading Style */}
            <div className="space-y-3">
              {/* Sales vs Expenses Bar Chart */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1.5 text-blue-400" />
                    Daily Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={[
                      { name: 'Today', sales: stats.todaysRevenue, expenses: stats.totalExpenses / 30 },
                      { name: 'Average', sales: stats.totalSales / 30, expenses: stats.totalExpenses / 30 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', fontSize: '11px' }}
                        formatter={(value: number) => `₱${value.toLocaleString()}`}
                      />
                      <Bar dataKey="sales" fill="#4ade80" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Trend Area Chart */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center">
                    <Activity className="h-4 w-4 mr-1.5 text-green-400" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={[
                      { time: '6AM', revenue: stats.todaysRevenue * 0.1 },
                      { time: '9AM', revenue: stats.todaysRevenue * 0.3 },
                      { time: '12PM', revenue: stats.todaysRevenue * 0.5 },
                      { time: '3PM', revenue: stats.todaysRevenue * 0.7 },
                      { time: '6PM', revenue: stats.todaysRevenue * 0.9 },
                      { time: 'Now', revenue: stats.todaysRevenue }
                    ]}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="time" stroke="#888" fontSize={9} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', fontSize: '11px' }}
                        formatter={(value: number) => `₱${value.toLocaleString()}`}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#4ade80" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Profit Breakdown Pie Chart */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center">
                    <PieChart className="h-4 w-4 mr-1.5 text-purple-400" />
                    Profit Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ResponsiveContainer width="100%" height={120}>
                    <RechartsPie>
                      <Pie
                        data={[
                          { name: 'Sales', value: stats.totalSales, color: '#4ade80' },
                          { name: 'Expenses', value: stats.totalExpenses, color: '#f87171' },
                          { name: 'Net Profit', value: Math.max(0, stats.totalSales - stats.totalExpenses), color: '#60a5fa' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Sales', value: stats.totalSales, color: '#4ade80' },
                          { name: 'Expenses', value: stats.totalExpenses, color: '#f87171' },
                          { name: 'Net Profit', value: Math.max(0, stats.totalSales - stats.totalExpenses), color: '#60a5fa' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', fontSize: '11px' }}
                        formatter={(value: number) => `₱${value.toLocaleString()}`}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="flex justify-around mt-2">
                    <div className="text-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mb-1"></div>
                      <p className="text-[10px] text-green-400">Sales</p>
                    </div>
                    <div className="text-center">
                      <div className="w-2 h-2 bg-red-400 rounded-full mx-auto mb-1"></div>
                      <p className="text-[10px] text-red-400">Expenses</p>
                    </div>
                    <div className="text-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mb-1"></div>
                      <p className="text-[10px] text-blue-400">Profit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="min-h-screen w-full galaxy-animated cosmic-overlay">

      {/* Dashboard Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <img 
                  src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
                  alt="Charnoks" 
                  className="h-16 w-16 object-contain animate-pulse-glow"
                />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Charnoks POS
                </h1>
              </div>
              <p className="text-blue-200">Command Center • Owner Dashboard</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCreateWorker(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 shadow-xl backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <FirebaseTestButton />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-3">Record Sale</h3>
                  <p className="text-green-100">Process new transactions</p>
                </div>
                <ShoppingCart className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-3">Record Expense</h3>
                  <p className="text-orange-100">Track business costs</p>
                </div>
                <Receipt className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-3">View Summary</h3>
                  <p className="text-purple-100">Business insights</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-xl border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Dashboard Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Transaction History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">
                    Total Sales
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    ₱{stats.totalSales.toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-200 mt-1">
                    All time revenue
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">
                    Total Expenses
                  </CardTitle>
                  <Receipt className="h-5 w-5 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-400">
                    ₱{stats.totalExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-200 mt-1">All expenses</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">
                    Workers
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">
                    {stats.totalWorkers}
                  </div>
                  <p className="text-xs text-blue-200 mt-1">Active workers</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-200">
                    Today's Revenue
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400">
                    ₱{stats.todaysRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-200 mt-1">Sales today</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="border-b border-white/20">
                <CardTitle className="flex items-center text-xl text-white">
                  <Receipt className="h-6 w-6 mr-3 text-blue-400" />
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Latest sales and expenses from your business
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-blue-300 mx-auto mb-4 opacity-50" />
                      <p className="text-blue-200 text-lg">
                        No transactions recorded yet
                      </p>
                      <p className="text-blue-300 opacity-60">
                        Start by recording your first sale or expense
                      </p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200 shadow-lg backdrop-blur-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              transaction.type === "sale"
                                ? "bg-green-400 shadow-green-400/50 shadow-lg"
                                : "bg-red-400 shadow-red-400/50 shadow-lg"
                            }`}
                          ></div>
                          <div>
                            <p className="font-semibold text-white">
                              {transaction.type === "sale"
                                ? "Sale"
                                : "Expense"}
                              {transaction.workerEmail && (
                                <span className="text-sm text-blue-300 ml-2 font-normal">
                                  by {transaction.workerEmail}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-blue-200">
                              {transaction.description ||
                                (transaction.items &&
                                  `${transaction.items.length} item(s)`) ||
                                "Transaction"}{" "}
                              •{" "}
                              {formatDate(transaction.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              transaction.type === "sale"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {transaction.type === "sale" ? "+" : "-"}₱
                            {transaction.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant={
                              transaction.type === "sale"
                                ? "default"
                                : "secondary"
                            }
                            className={`shadow-sm ${
                              transaction.type === "sale"
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Prepare chart data
  const chartData = [
    { name: 'Mon', sales: 4500, expenses: 2000 },
    { name: 'Tue', sales: 5200, expenses: 2300 },
    { name: 'Wed', sales: 4800, expenses: 2100 },
    { name: 'Thu', sales: 6100, expenses: 2500 },
    { name: 'Fri', sales: 7200, expenses: 2800 },
    { name: 'Sat', sales: 8500, expenses: 3200 },
    { name: 'Sun', sales: 6900, expenses: 2700 },
  ];

  const pieData = [
    { name: 'Sales', value: stats.totalSales, color: '#10b981' },
    { name: 'Expenses', value: stats.totalExpenses, color: '#ef4444' },
  ];

  const profitData = [
    { name: 'Week 1', profit: 12500 },
    { name: 'Week 2', profit: 15200 },
    { name: 'Week 3', profit: 14800 },
    { name: 'Week 4', profit: 18100 },
  ];

  return (
    <OptimizedLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Overview - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="card-enhanced hover:scale-105 transition-transform duration-300">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-white/70">Total Sales</p>
                  <p className="text-base md:text-2xl font-bold text-green-400">
                    ₱{stats.totalSales.toLocaleString()}
                  </p>
                </div>
                <span className="text-xl md:text-2xl">💸</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced hover:scale-105 transition-transform duration-300">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-white/70">Total Expenses</p>
                  <p className="text-base md:text-2xl font-bold text-red-400">
                    ₱{stats.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <span className="text-xl md:text-2xl">🧾</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced hover:scale-105 transition-transform duration-300">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-white/70">Net Profit</p>
                  <p className="text-base md:text-2xl font-bold text-blue-400">
                    ₱{(stats.totalSales - stats.totalExpenses).toLocaleString()}
                  </p>
                </div>
                <span className="text-xl md:text-2xl">📈</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced hover:scale-105 transition-transform duration-300">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-white/70">Today's Revenue</p>
                  <p className="text-base md:text-2xl font-bold text-purple-400">
                    ₱{stats.todaysRevenue.toLocaleString()}
                  </p>
                </div>
                <span className="text-xl md:text-2xl">💰</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Sales vs Expenses Chart */}
          <Card className="card-enhanced">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-white text-base md:text-xl flex items-center gap-2">
                <span className="text-xl md:text-2xl">📊</span>
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-4">
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#fff" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <YAxis stroke="#fff" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                  <Bar dataKey="sales" fill="#10b981" name="Sales" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit Trend Chart */}
          <Card className="card-enhanced">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-white text-base md:text-xl flex items-center gap-2">
                <span className="text-xl md:text-2xl">📈</span>
                Profit Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-4">
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <AreaChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#fff" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <YAxis stroke="#fff" tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#8b5cf6" 
                    fill="url(#colorProfit)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Distribution Pie Chart */}
          <Card className="card-enhanced">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-white text-base md:text-xl flex items-center gap-2">
                <span className="text-xl md:text-2xl">🥧</span>
                Revenue Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-4">
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <RechartsPie data={pieData}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 60}
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-enhanced">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-white text-base md:text-xl flex items-center gap-2">
                <span className="text-xl md:text-2xl">⚡</span>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => setShowCreateWorker(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Worker Account
              </Button>
              <Link to="/products" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Products
                </Button>
              </Link>
              <Link to="/analysis" className="block">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Analysis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Worker Modal */}
      {showCreateWorker && (
        <CreateWorkerAccount onClose={() => setShowCreateWorker(false)} />
      )}
    </OptimizedLayout>
  );
};
