import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { OfflineState } from "@/lib/offlineState";
import { Transaction } from "@/types/product";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ResponsiveLayout } from "@/components/dashboard/ResponsiveLayout";
import {
  Download,
  Search,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
} from "lucide-react";

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this-week", label: "This Week" },
  { value: "last-week", label: "Last Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "all", label: "All Time" },
];

export const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("today");

  useEffect(() => {
    fetchTransactions();
    fetchWorkers();
  }, [user, selectedDateRange]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedWorker, selectedDateRange]);

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      if (!OfflineState.hasFirebaseAccess()) {
        console.log("Using local storage transactions");
        const localTransactions = LocalStorageDB.getTransactions();
        const processedTransactions = localTransactions.map((t) => ({
          ...t,
          type: t.type || "sale"
        })) as Transaction[];
        setTransactions(processedTransactions);
        
        const uniqueWorkers = Array.from(new Set(
          processedTransactions.map((u: any) => u.workerEmail).filter(Boolean)
        ));
        setWorkers(uniqueWorkers as string[]);
        setIsLoading(false);
        return;
      }

      if (OfflineState.hasFirebaseAccess()) {
        let transactionsQuery;
        
        if (user?.role === 'owner') {
          transactionsQuery = query(
            collection(db, 'sales'),
            orderBy('createdAt', 'desc')
          );
        } else {
          transactionsQuery = query(
            collection(db, 'sales'),
            where('workerEmail', '==', user?.email),
            orderBy('createdAt', 'desc')
          );
        }

        const snapshot = await getDocs(transactionsQuery);
        const allTransactions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: "sale" as const,
            items: data.items || [],
            totalAmount: data.totalAmount || data.amount,
            amountPaid: data.amountPaid,
            change: data.change,
            paymentMethod: data.paymentMethod,
            workerId: data.workerId,
            workerEmail: data.workerEmail,
            timestamp: data.createdAt?.toDate() || data.timestamp?.toDate() || new Date(),
            isVoiceTransaction: data.isVoiceTransaction || false,
            voiceInput: data.voiceInput,
            status: data.status || 'completed'
          } as Transaction;
        });

        setTransactions(allTransactions);
        
        const uniqueWorkers = Array.from(new Set(
          allTransactions.map((u: any) => u.workerEmail).filter(Boolean)
        ));
        setWorkers(uniqueWorkers as string[]);
      } else {
        const localTransactions = LocalStorageDB.getTransactions();
        const processedTransactions = localTransactions.map((t) => ({
          ...t,
          type: t.type || "sale"
        })) as Transaction[];
        setTransactions(processedTransactions);
        
        const uniqueWorkers = Array.from(new Set(
          processedTransactions.map((u: any) => u.workerEmail).filter(Boolean)
        ));
        setWorkers(uniqueWorkers as string[]);
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      
      const localTransactions = LocalStorageDB.getTransactions();
      const processedTransactions = localTransactions.map((t) => ({
        ...t,
        type: t.type || "sale"
      })) as Transaction[];
      setTransactions(processedTransactions);
      
      const uniqueWorkers = Array.from(new Set(
        processedTransactions.map((u: any) => u.workerEmail).filter(Boolean)
      ));
      setWorkers(uniqueWorkers as string[]);
      
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Using offline data.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const fetchWorkers = async () => {
    if (!OfflineState.hasFirebaseAccess()) {
      console.log("Using local storage workers (Firebase disabled)");
      const localUsers = LocalStorageDB.getUsers()
        .filter((u: any) => u.role === "worker")
        .map((u: any) => ({ id: u.id, email: u.email }));
      setWorkers(localUsers);
      return;
    }

    try {
      if (OfflineState.hasFirebaseAccess()) {
        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", "worker"),
        );
        const snapshot = await getDocs(usersQuery);
        const workersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          email: doc.data().email || "",
        }));
        setWorkers(workersData);
      } else {
        const localUsers = LocalStorageDB.getUsers()
          .filter((u: any) => u.role === "worker")
          .map((u: any) => ({ id: u.id, email: u.email }));
        setWorkers(localUsers);
      }
    } catch (error: any) {
      console.error("Error fetching workers:", error);
      if (OfflineState.isNetworkError(error)) {
        const localUsers = LocalStorageDB.getUsers()
          .filter((u: any) => u.role === "worker")
          .map((u: any) => ({ id: u.id, email: u.email }));
        setWorkers(localUsers);
      }
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.workerEmail
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (transaction.items || []).some((item) =>
            item.productName?.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          transaction.id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Worker filter
    if (selectedWorker !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.workerEmail === selectedWorker,
      );
    }

    // Date range filter
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (selectedDateRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "yesterday":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "this-week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date();
        break;
      case "last-week":
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        lastWeekStart.setHours(0, 0, 0, 0);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      case "this-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "all":
      default:
        // No date filtering
        break;
    }

    if (startDate && endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.timestamp);
        return transactionDate >= startDate! && transactionDate < endDate!;
      });
    }

    setFilteredTransactions(filtered);
  };

  const calculateSummary = () => {
    const totalSales = filteredTransactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + (t.totalAmount || t.amount || 0), 0);
      
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
      
    const netProfit = totalSales - totalExpenses;
    const totalTransactions = filteredTransactions.length;

    return {
      totalSales,
      totalExpenses,
      netProfit,
      totalTransactions,
    };
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatFullDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportTransactions = () => {
    const csvContent = [
      // Header
      ['ID', 'Date', 'Worker', 'Type', 'Items', 'Total Amount', 'Amount Paid', 'Change', 'Payment Method', 'Status'].join(','),
      // Data rows
      ...filteredTransactions.map(transaction => {
        const row = [
          transaction.id,
          formatFullDateTime(transaction.timestamp),
          transaction.workerEmail || '',
          transaction.type,
        ];
        
        if (transaction.items && Array.isArray(transaction.items)) {
          (transaction.items || []).forEach(item => {
            row.push(`${item.productName} (${item.quantity})`);
          });
          row.push((transaction.totalAmount || transaction.amount || 0).toString());
          row.push((transaction.amountPaid || 0).toString());
          row.push((transaction.change || 0).toString());
        } else {
          row.push('N/A');
          row.push((transaction.amount || 0).toString());
          row.push('N/A');
          row.push('N/A');
        }
        
        row.push(transaction.paymentMethod || 'cash');
        row.push(transaction.status || 'completed');
        
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${formatDateTime(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = calculateSummary();

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Transaction History</h1>
            <p className="text-gray-300 mt-1">
              {user?.role === 'owner' ? 'All business transactions' : 'Your transaction history'}
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
            {user?.role?.toUpperCase()}: {user?.email}
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Sales</p>
                  <p className="text-2xl font-bold text-green-400">
                    ₱{summary.totalSales.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-400">
                    ₱{summary.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Net Profit</p>
                  <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₱{summary.netProfit.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Transactions</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {summary.totalTransactions}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Filters</CardTitle>
            <CardDescription className="text-gray-300">
              Filter transactions by search, worker, and date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              {user?.role === 'owner' && (
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Workers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workers</SelectItem>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id || worker.email} value={worker.email || worker}>
                        {worker.email || worker}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={exportTransactions}
                disabled={filteredTransactions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">
              Transactions ({filteredTransactions.length})
            </CardTitle>
            <CardDescription className="text-gray-300">
              {selectedDateRange === 'all' ? 'All transactions' : `Transactions for ${DATE_RANGES.find(r => r.value === selectedDateRange)?.label}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No transactions found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            variant={transaction.type === 'sale' ? 'default' : 'destructive'}
                            className={
                              transaction.type === 'sale'
                                ? 'bg-green-600 text-white'
                                : 'bg-red-600 text-white'
                            }
                          >
                            {transaction.type?.toUpperCase()}
                          </Badge>
                          
                          {transaction.isVoiceTransaction && (
                            <Badge variant="outline" className="border-purple-400 text-purple-400">
                              Voice
                            </Badge>
                          )}
                          
                          <span className="text-sm text-gray-400">
                            {formatDate(transaction.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-white font-medium">
                            {transaction.workerEmail}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-400">
                          {(transaction.items || []).length} item(s)
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {transaction.id}
                        </div>
                      </div>
                      
                      {transaction.type === 'sale' ? (
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            ₱{(transaction.totalAmount || transaction.amount || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Change: ₱{(transaction.change || 0).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="font-bold text-red-400">
                            -₱{(transaction.amount || transaction.amountPaid || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {transaction.description || 'Expense'}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {transaction.items && transaction.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap gap-2">
                          {transaction.items.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 text-xs text-gray-300"
                            >
                              {item.quantity}x {item.productName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
};