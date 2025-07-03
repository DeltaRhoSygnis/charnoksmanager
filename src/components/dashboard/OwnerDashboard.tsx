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
} from "lucide-react";
import { format } from "date-fns";
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
          items: t.items,
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
            items: t.items,
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
            items: t.items,
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
        {/* Dashboard Header with Actions */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Owner Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  Manage your business operations
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCreateWorker(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Worker
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FirebaseTestButton />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Dashboard Overview</TabsTrigger>
              <TabsTrigger value="transactions">
                Transaction History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-100">
                      Total Sales
                    </CardTitle>
                    <DollarSign className="h-5 w-5 text-emerald-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ₱{stats.totalSales.toFixed(2)}
                    </div>
                    <p className="text-xs text-emerald-100 mt-1">
                      All time revenue
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-rose-100">
                      Total Expenses
                    </CardTitle>
                    <Receipt className="h-5 w-5 text-rose-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ₱{stats.totalExpenses.toFixed(2)}
                    </div>
                    <p className="text-xs text-rose-100 mt-1">All expenses</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-100">
                      Workers
                    </CardTitle>
                    <Users className="h-5 w-5 text-blue-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {stats.totalWorkers}
                    </div>
                    <p className="text-xs text-blue-100 mt-1">Active workers</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-100">
                      Today's Revenue
                    </CardTitle>
                    <TrendingUp className="h-5 w-5 text-purple-200" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ₱{stats.todaysRevenue.toFixed(2)}
                    </div>
                    <p className="text-xs text-purple-100 mt-1">Sales today</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card className="bg-white/80 backdrop-blur-sm border-orange-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <Receipt className="h-6 w-6 mr-3" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    Latest sales and expenses from your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                          No transactions recorded yet
                        </p>
                        <p className="text-gray-400">
                          Start by recording your first sale or expense
                        </p>
                      </div>
                    ) : (
                      transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-5 bg-gradient-to-r from-white to-orange-50 border border-orange-100 rounded-xl hover:from-orange-50 hover:to-orange-100 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                transaction.type === "sale"
                                  ? "bg-green-500 shadow-green-200 shadow-lg"
                                  : "bg-red-500 shadow-red-200 shadow-lg"
                              }`}
                            ></div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {transaction.type === "sale"
                                  ? "Sale"
                                  : "Expense"}
                                {transaction.workerEmail && (
                                  <span className="text-sm text-gray-500 ml-2 font-normal">
                                    by {transaction.workerEmail}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                {transaction.description ||
                                  (transaction.items &&
                                    `${transaction.items.length} item(s)`) ||
                                  "Transaction"}{" "}
                                •{" "}
                                {format(
                                  transaction.timestamp,
                                  "MMM dd, yyyy HH:mm",
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold text-lg ${
                                transaction.type === "sale"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "sale" ? "+" : "-"}₱
                              {transaction.amount.toFixed(2)}
                            </p>
                            <Badge
                              variant={
                                transaction.type === "sale"
                                  ? "default"
                                  : "secondary"
                              }
                              className="shadow-sm"
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
