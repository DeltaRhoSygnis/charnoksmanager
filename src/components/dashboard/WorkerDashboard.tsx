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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Receipt, DollarSign, Package, Stars, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface WorkerTransaction {
  id: string;
  type: "sale" | "expense";
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
    totalTransactions: 0,
  });

  useEffect(() => {
    fetchWorkerTransactions();
    calculateWorkerStats();
  }, [user]);

  const fetchWorkerTransactions = async () => {
    if (!user || !user.uid) {
      console.log("User not authenticated, skipping worker transaction fetch");
      return;
    }

    try {
      // Fetch worker's sales
      const salesQuery = query(
        collection(db, "sales"),
        where("workerEmail", "==", user.email),
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
          items: data.items,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      });

      // Fetch worker's expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("workerEmail", "==", user.email),
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
    } catch (error: any) {
      console.error("Error fetching worker transactions:", error);
      if (error.code === "permission-denied") {
        console.warn(
          "Firestore access denied. This might be due to database security rules.",
        );
      }
    }
  };

  const calculateWorkerStats = async () => {
    if (!user || !user.uid) {
      console.log("User not authenticated, skipping worker stats calculation");
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate today's sales
      const salesQuery = query(
        collection(db, "sales"),
        where("workerEmail", "==", user.email),
        where("timestamp", ">=", today),
      );
      const salesSnapshot = await getDocs(salesQuery);
      const todaySales = salesSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().total || 0),
        0,
      );

      // Calculate today's expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("workerEmail", "==", user.email),
        where("timestamp", ">=", today),
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const todayExpenses = expensesSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0),
        0,
      );

      // Total transactions count
      const totalTransactions = salesSnapshot.size + expensesSnapshot.size;

      setStats({
        todaySales,
        todayExpenses,
        totalTransactions,
      });
    } catch (error: any) {
      console.error("Error calculating worker stats:", error);
      if (error.code === "permission-denied") {
        console.warn(
          "Firestore access denied. This might be due to database security rules.",
        );
      }
    }
  };

  return (
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
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
              alt="Charnoks" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Charnoks POS
              </h2>
              <p className="text-blue-200">Worker Station • {user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/sales">
            <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 hover:shadow-2xl transition-all duration-200 cursor-pointer transform hover:scale-105 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Record Sale</h3>
                    <p className="text-green-100 text-lg">Process new transactions</p>
                  </div>
                  <ShoppingCart className="h-16 w-16 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/expenses">
            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 hover:shadow-2xl transition-all duration-200 cursor-pointer transform hover:scale-105 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Record Expense</h3>
                    <p className="text-orange-100 text-lg">Track business costs</p>
                  </div>
                  <Receipt className="h-16 w-16 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">
                Today's Sales
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                ₱{stats.todaySales.toLocaleString()}
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Sales recorded today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">
                Today's Expenses
              </CardTitle>
              <Receipt className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">
                ₱{stats.todayExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Expenses recorded today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">
                Total Transactions
              </CardTitle>
              <Package className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {stats.totalTransactions}
              </div>
              <p className="text-xs text-blue-200 mt-1">
                Today's transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="border-b border-white/20">
            <CardTitle className="text-xl text-white flex items-center">
              <Receipt className="h-6 w-6 mr-3 text-blue-400" />
              My Recent Transactions
            </CardTitle>
            <CardDescription className="text-blue-200">
              Your latest sales and expenses
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
                          {transaction.type === "sale" ? "Sale" : "Expense"}
                        </p>
                        <p className="text-sm text-blue-200">
                          {transaction.description ||
                            (transaction.items &&
                              `${transaction.items.length} item(s)`) ||
                            "Transaction"}{" "}
                          •{" "}
                          {format(transaction.timestamp, "MMM dd, yyyy HH:mm")}
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
                          transaction.type === "sale" ? "default" : "secondary"
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
      </div>
    </div>
  );
};
