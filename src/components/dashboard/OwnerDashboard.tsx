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
  ArrowRight,
  Activity,
  CreditCard,
  UserPlus,
  BarChart2,
  CalendarClock,
  Briefcase
} from "lucide-react";
import { Sale } from "@/types/sales";
import { CreateWorkerAccount } from "@/components/worker/CreateWorkerAccount";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.uid) {
      setLoading(true);
      Promise.all([fetchTransactions(), calculateStats()])
        .finally(() => setLoading(false));
    }
  }, [user]);

  const fetchTransactions = async () => {
    // ... existing fetchTransactions logic ...
  };

  const calculateStats = async () => {
    // ... existing calculateStats logic ...
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const renderMetricCard = (title: string, value: string | number, icon: JSX.Element, color: string) => (
    <Card className="bg-background border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4 flex items-center">
        <div className={`p-3 rounded-lg ${color} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );

  const renderActionCard = (title: string, description: string, icon: JSX.Element, color: string) => (
    <Card className="bg-background border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className={`p-3 rounded-lg ${color} w-12 h-12 flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </CardContent>
    </Card>
  );

  const renderTransactionItem = (transaction: Transaction) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors rounded-lg">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg mr-4 ${
          transaction.type === "sale" 
            ? "bg-green-100 text-green-600" 
            : "bg-red-100 text-red-600"
        }`}>
          {transaction.type === "sale" ? <ShoppingCart size={16} /> : <Receipt size={16} />}
        </div>
        <div>
          <p className="font-medium">
            {transaction.type === "sale" ? "Sale" : "Expense"}
          </p>
          <p className="text-sm text-gray-500 flex items-center">
            <CalendarClock size={14} className="mr-1" />
            {formatDate(transaction.timestamp)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${
          transaction.type === "sale" ? "text-green-600" : "text-red-600"
        }`}>
          {transaction.type === "sale" ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
        {transaction.workerEmail && (
          <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
            <Briefcase size={12} className="mr-1" />
            {transaction.workerEmail}
          </p>
        )}
      </div>
    </div>
  );

  const renderSkeletonLoader = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Skeleton className="w-10 h-10 rounded-lg mr-3" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-lg mr-4" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const MobileLayout = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
                alt="Charnoks" 
                className="h-8 w-8 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  Charnoks POS
                </h1>
                <p className="text-xs text-gray-500">Owner Dashboard</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateWorker(true)}
              className="bg-primary text-white text-xs px-2 py-1"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Worker
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <FirebaseTestButton className="mb-4" />

        {loading ? renderSkeletonLoader() : (
          <>
            {/* Mobile Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              {renderActionCard(
                "Record Sale",
                "Process new transactions",
                <ShoppingCart size={20} className="text-white" />,
                "bg-green-500"
              )}
              
              {renderActionCard(
                "Record Expense",
                "Track business costs",
                <Receipt size={20} className="text-white" />,
                "bg-amber-500"
              )}
              
              {renderActionCard(
                "View Summary",
                "Business insights",
                <BarChart2 size={20} className="text-white" />,
                "bg-indigo-500"
              )}
            </div>

            {/* Mobile Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white border">
                <TabsTrigger value="overview" className="text-xs">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs">
                  Transactions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Mobile Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {renderMetricCard(
                    "Total Sales",
                    formatCurrency(stats.totalSales),
                    <DollarSign size={20} className="text-green-600" />,
                    "bg-green-100"
                  )}
                  
                  {renderMetricCard(
                    "Total Expenses",
                    formatCurrency(stats.totalExpenses),
                    <Receipt size={20} className="text-red-600" />,
                    "bg-red-100"
                  )}
                  
                  {renderMetricCard(
                    "Active Workers",
                    stats.totalWorkers,
                    <Users size={20} className="text-blue-600" />,
                    "bg-blue-100"
                  )}
                  
                  {renderMetricCard(
                    "Today's Revenue",
                    formatCurrency(stats.todaysRevenue),
                    <Activity size={20} className="text-purple-600" />,
                    "bg-purple-100"
                  )}
                </div>

                {/* Mobile Recent Transactions */}
                <Card className="bg-white border rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No transactions yet</p>
                      </div>
                    ) : (
                      transactions.slice(0, 5).map(renderTransactionItem)
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="mt-4">
                <TransactionHistory />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );

  const DesktopLayout = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
                alt="Charnoks" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Charnoks POS
                </h1>
                <p className="text-gray-600">Command Center • Owner Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Live Mode
                </div>
              </Badge>
              <Button
                onClick={() => setShowCreateWorker(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Worker
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FirebaseTestButton className="mb-6" />

        {loading ? renderSkeletonLoader() : (
          <>
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {renderActionCard(
                "Record Sale",
                "Process new transactions",
                <ShoppingCart size={24} className="text-white" />,
                "bg-green-500"
              )}
              
              {renderActionCard(
                "Record Expense",
                "Track business costs",
                <Receipt size={24} className="text-white" />,
                "bg-amber-500"
              )}
              
              {renderActionCard(
                "View Summary",
                "Business insights",
                <BarChart2 size={24} className="text-white" />,
                "bg-indigo-500"
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {renderMetricCard(
                "Total Sales",
                formatCurrency(stats.totalSales),
                <DollarSign size={20} className="text-green-600" />,
                "bg-green-100"
              )}
              
              {renderMetricCard(
                "Total Expenses",
                formatCurrency(stats.totalExpenses),
                <Receipt size={20} className="text-red-600" />,
                "bg-red-100"
              )}
              
              {renderMetricCard(
                "Active Workers",
                stats.totalWorkers,
                <Users size={20} className="text-blue-600" />,
                "bg-blue-100"
              )}
              
              {renderMetricCard(
                "Today's Revenue",
                formatCurrency(stats.todaysRevenue),
                <Activity size={20} className="text-purple-600" />,
                "bg-purple-100"
              )}
            </div>

            {/* Recent Transactions */}
            <Card className="bg-white border rounded-xl shadow-sm">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Transactions
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No transactions recorded yet</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Start recording sales and expenses to see them here
                      </p>
                    </div>
                  ) : (
                    transactions.slice(0, 5).map(renderTransactionItem)
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <Card className="bg-white border rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">This Month</span>
                        <span className="font-medium">{formatCurrency(stats.todaysRevenue * 30)}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Quarterly Target</span>
                        <span className="font-medium">{formatCurrency(stats.totalSales * 0.8)}</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Team Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Worker Performance</p>
                          <p className="text-sm text-gray-500">Top performers this month</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <CalendarClock className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Shift Schedule</p>
                          <p className="text-sm text-gray-500">Upcoming shifts</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      
      {showCreateWorker && (
        <CreateWorkerAccount onClose={() => setShowCreateWorker(false)} />
      )}
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};