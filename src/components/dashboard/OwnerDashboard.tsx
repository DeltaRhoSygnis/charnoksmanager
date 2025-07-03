
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";
import { Sale } from "@/types/sales";
import { CreateWorkerAccount } from "@/components/worker/CreateWorkerAccount";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    totalWorkers: 0,
    todaysRevenue: 0,
  });
  const [showCreateWorker, setShowCreateWorker] = useState(false);

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

    // Check Firebase access first to prevent fetch errors
    if (!OfflineState.hasFirebaseAccess()) {
      console.log("Using local storage transactions (Firebase disabled)");
      const localTransactions = LocalStorageDB.getTransactions()
        .slice(0, 10)
        .map((t) => ({
          id: t.id,
          type: "sale" as const,
          amount: t.totalAmount,
          workerEmail: t.workerEmail,
          items: t.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price
          })),
          timestamp: t.timestamp,
        }));
      setTransactions(localTransactions);
      return;
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
            amount: data.total,
            workerEmail: data.workerEmail,
            items: data.items,
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
        // Use local storage transactions
        const localTransactions = LocalStorageDB.getTransactions()
          .slice(0, 10)
          .map((t) => ({
            id: t.id,
            type: "sale" as const,
            amount: t.totalAmount,
            workerEmail: t.workerEmail,
            items: t.items.map(item => ({
              name: item.productName,
              quantity: item.quantity,
              price: item.price
            })),
            timestamp: t.timestamp,
          }));
        setTransactions(localTransactions);
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
            amount: t.totalAmount,
            workerEmail: t.workerEmail,
            items: t.items.map(item => ({
              name: item.productName,
              quantity: item.quantity,
              price: item.price
            })),
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

    // Check Firebase access first to prevent fetch errors
    if (!OfflineState.hasFirebaseAccess()) {
      console.log("Using local storage stats (Firebase disabled)");
      const localStats = LocalStorageDB.calculateStats();
      setStats({
        totalSales: localStats.totalSales,
        totalExpenses: localStats.totalExpenses,
        totalWorkers: localStats.totalWorkers,
        todaysRevenue: localStats.todaysRevenue,
      });
      return;
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
        // Use local storage stats
        const localStats = LocalStorageDB.calculateStats();
        setStats({
          totalSales: localStats.totalSales,
          totalExpenses: localStats.totalExpenses,
          totalWorkers: localStats.totalWorkers,
          todaysRevenue: localStats.todaysRevenue,
        });
      }
    } catch (error: any) {
      console.error("Error calculating stats:", error);

      if (OfflineState.isNetworkError(error)) {
        // Fallback to local storage stats
        const localStats = LocalStorageDB.calculateStats();
        setStats({
          totalSales: localStats.totalSales,
          totalExpenses: localStats.totalExpenses,
          totalWorkers: localStats.totalWorkers,
          todaysRevenue: localStats.todaysRevenue,
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-blue-300 opacity-10 animate-pulse">
            <Stars size={32} />
          </div>
          <div className="absolute top-40 right-20 text-purple-300 opacity-15 animate-bounce">
            <Sparkles size={24} />
          </div>
          <div className="absolute bottom-20 left-1/4 text-blue-400 opacity-10 animate-pulse">
            <Stars size={28} />
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-xl relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <img 
                    src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
                    alt="Charnoks" 
                    className="h-10 w-10 object-contain"
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

      {/* Create Worker Modal */}
      {showCreateWorker && (
        <CreateWorkerAccount onClose={() => setShowCreateWorker(false)} />
      )}
    </>
  );
};
