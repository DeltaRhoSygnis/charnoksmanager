import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarDays, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Search, 
  Eye, 
  Filter,
  ArrowLeft,
  Calendar,
  BarChart3,
  Activity,
  Target
} from "lucide-react";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { OfflineState } from "@/lib/offlineState";
import { format, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Transaction } from "@/types/product";

interface WorkerSummary {
  workerId: string;
  workerEmail: string;
  totalSales: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  lastActivity: Date;
  dailyData: { [date: string]: { sales: number; expenses: number; transactions: number } };
}

interface TransactionsByDate {
  [date: string]: Transaction[];
}

type ViewMode = 'workers' | 'worker-details' | 'date-transactions';

export const Transactions = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('workers');
  const [workers, setWorkers] = useState<WorkerSummary[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<WorkerSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [transactionsByDate, setTransactionsByDate] = useState<TransactionsByDate>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkersData();
  }, []);

  const loadWorkersData = async () => {
    try {
      setLoading(true);
      const { DataService } = await import("@/lib/dataService");
      const transactions = await DataService.getTransactions();
      const users = LocalStorageDB.getUsers(); // Keep users local for now
      
      // Group transactions by worker
      const workerMap = new Map<string, WorkerSummary>();
      
      transactions.forEach((transaction) => {
        const workerId = transaction.workerId || 'unknown';
        const workerEmail = transaction.workerEmail || 'Unknown Worker';
        
        if (!workerMap.has(workerId)) {
          workerMap.set(workerId, {
            workerId,
            workerEmail,
            totalSales: 0,
            totalExpenses: 0,
            netAmount: 0,
            transactionCount: 0,
            lastActivity: new Date(transaction.timestamp),
            dailyData: {}
          });
        }
        
        const worker = workerMap.get(workerId)!;
        const transactionDate = format(new Date(transaction.timestamp), 'yyyy-MM-dd');
        
        // Initialize daily data if not exists
        if (!worker.dailyData[transactionDate]) {
          worker.dailyData[transactionDate] = { sales: 0, expenses: 0, transactions: 0 };
        }
        
        worker.transactionCount++;
        worker.dailyData[transactionDate].transactions++;
        
        if (transaction.type === 'sale') {
          const amount = transaction.totalAmount || transaction.amount || 0;
          worker.totalSales += amount;
          worker.dailyData[transactionDate].sales += amount;
        } else if (transaction.type === 'expense') {
          const amount = transaction.amount || 0;
          worker.totalExpenses += amount;
          worker.dailyData[transactionDate].expenses += amount;
        }
        
        worker.netAmount = worker.totalSales - worker.totalExpenses;
        
        // Update last activity
        if (new Date(transaction.timestamp) > worker.lastActivity) {
          worker.lastActivity = new Date(transaction.timestamp);
        }
      });
      
      const workersArray = Array.from(workerMap.values())
        .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      
      setWorkers(workersArray);
    } catch (error) {
      console.error("Error loading workers data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerSelect = (worker: WorkerSummary) => {
    setSelectedWorker(worker);
    setViewMode('worker-details');
  };

  const handleDateSelect = (date: string) => {
    if (!selectedWorker) return;
    
    const transactions = LocalStorageDB.getTransactions();
    const workerTransactions = transactions.filter(
      (t) => t.workerId === selectedWorker.workerId && 
      format(new Date(t.timestamp), 'yyyy-MM-dd') === date
    );
    
    setTransactionsByDate({ [date]: workerTransactions });
    setSelectedDate(date);
    setViewMode('date-transactions');
  };

  const filteredWorkers = workers.filter(worker =>
    worker.workerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM dd, yyyy");
  };

  const formatCurrency = (amount: number) => `₱${amount.toFixed(2)}`;

  const getDateStatus = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return "today";
    if (isYesterday(d)) return "yesterday";
    return "past";
  };

  if (loading) {
    return (
      <OptimizedLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-16">
            <Activity className="h-24 w-24 text-gray-500 mx-auto mb-6 opacity-50 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-4">Loading Transactions...</h3>
            <p className="text-gray-300 text-lg">Please wait while we analyze worker data</p>
          </div>
        </div>
      </OptimizedLayout>
    );
  }

  // Workers Overview
  if (viewMode === 'workers') {
    return (
      <OptimizedLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 charnoks-text">
                Transaction Management
              </h1>
              <p className="text-gray-300 text-lg">
                Monitor worker performance and transaction history
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => window.location.href = '/data-analysis'}
                className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Data Analysis
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="card-visible">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-white mb-2 block">Search Workers</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by worker email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/30 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white mb-2 block">Date Range</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => (
              <Card
                key={worker.workerId}
                className="card-visible hover:border-white/40 transition-all duration-300 cursor-pointer group"
                onClick={() => handleWorkerSelect(worker)}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-xl mb-2">
                        {worker.workerEmail}
                      </CardTitle>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                        {worker.transactionCount} transactions
                      </Badge>
                    </div>
                    <Eye className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Total Sales</p>
                        <p className="text-green-400 font-bold text-lg">
                          {formatCurrency(worker.totalSales)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Expenses</p>
                        <p className="text-red-400 font-bold text-lg">
                          {formatCurrency(worker.totalExpenses)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/20 pt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-400 text-sm">Net Amount</p>
                        <p className={`font-bold text-lg ${worker.netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(worker.netAmount)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-gray-400 text-sm">Last Activity</p>
                        <p className="text-gray-300 text-sm">
                          {formatDate(worker.lastActivity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWorkers.length === 0 && (
            <Card className="card-visible">
              <CardContent className="p-16 text-center">
                <Users className="h-24 w-24 text-gray-500 mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-4">No Workers Found</h3>
                <p className="text-gray-300 text-lg">
                  {searchTerm ? "No workers match your search criteria" : "No worker transactions recorded yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </OptimizedLayout>
    );
  }

  // Worker Details with Dates
  if (viewMode === 'worker-details' && selectedWorker) {
    const dates = Object.keys(selectedWorker.dailyData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    return (
      <OptimizedLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setViewMode('workers')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workers
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white charnoks-text">
                {selectedWorker.workerEmail}
              </h1>
              <p className="text-gray-300">Transaction history by date</p>
            </div>
          </div>

          {/* Worker Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="card-visible">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Total Sales</p>
                <p className="text-green-400 font-bold text-2xl">
                  {formatCurrency(selectedWorker.totalSales)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-visible">
              <CardContent className="p-6 text-center">
                <TrendingDown className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Total Expenses</p>
                <p className="text-red-400 font-bold text-2xl">
                  {formatCurrency(selectedWorker.totalExpenses)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-visible">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Net Amount</p>
                <p className={`font-bold text-2xl ${selectedWorker.netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(selectedWorker.netAmount)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-visible">
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Total Transactions</p>
                <p className="text-purple-400 font-bold text-2xl">
                  {selectedWorker.transactionCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Transactions */}
          <Card className="card-visible">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-400" />
                Daily Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dates.map((date) => {
                  const dayData = selectedWorker.dailyData[date];
                  const netAmount = dayData.sales - dayData.expenses;
                  const status = getDateStatus(date);
                  
                  return (
                    <Card
                      key={date}
                      className="bg-white/5 border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                      onClick={() => handleDateSelect(date)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="text-white font-semibold text-lg">
                                {formatDate(new Date(date))}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {dayData.transactions} transactions
                              </p>
                            </div>
                            {status === 'today' && (
                              <Badge className="bg-green-500/20 text-green-300">Today</Badge>
                            )}
                            {status === 'yesterday' && (
                              <Badge className="bg-blue-500/20 text-blue-300">Yesterday</Badge>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="grid grid-cols-3 gap-6">
                              <div>
                                <p className="text-gray-400 text-sm">Sales</p>
                                <p className="text-green-400 font-bold">
                                  {formatCurrency(dayData.sales)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Expenses</p>
                                <p className="text-red-400 font-bold">
                                  {formatCurrency(dayData.expenses)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Net</p>
                                <p className={`font-bold ${netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrency(netAmount)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </OptimizedLayout>
    );
  }

  // Date Transactions Detail
  if (viewMode === 'date-transactions' && selectedDate && selectedWorker) {
    const transactions = transactionsByDate[selectedDate] || [];
    
    return (
      <OptimizedLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setViewMode('worker-details')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dates
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white charnoks-text">
                {formatDate(new Date(selectedDate))} Transactions
              </h1>
              <p className="text-gray-300">
                {selectedWorker.workerEmail} • {transactions.length} transactions
              </p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <Card key={index} className="card-visible">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge 
                          variant={transaction.type === 'sale' ? 'default' : 'destructive'}
                          className={transaction.type === 'sale' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}
                        >
                          {transaction.type === 'sale' ? 'Sale' : 'Expense'}
                        </Badge>
                        <span className="text-gray-400 text-sm">
                          {format(new Date(transaction.timestamp), 'h:mm a')}
                        </span>
                      </div>
                      
                      {transaction.type === 'sale' && transaction.items && (
                        <div className="mb-3">
                          <p className="text-white font-medium mb-2">Items:</p>
                          {transaction.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="text-gray-300 text-sm ml-4">
                              {item.quantity}x {item.productName} - ₱{item.total.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {transaction.description && (
                        <p className="text-gray-300 text-sm mb-2">{transaction.description}</p>
                      )}
                      
                      {transaction.category && (
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                          {transaction.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold text-2xl ${
                        transaction.type === 'sale' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'sale' ? '+' : '-'}
                        {formatCurrency(transaction.totalAmount || transaction.amount || 0)}
                      </p>
                      {transaction.type === 'sale' && transaction.paymentMethod && (
                        <p className="text-gray-400 text-sm mt-1">
                          {transaction.paymentMethod}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {transactions.length === 0 && (
            <Card className="card-visible">
              <CardContent className="p-16 text-center">
                <Calendar className="h-24 w-24 text-gray-500 mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-bold text-white mb-4">No Transactions</h3>
                <p className="text-gray-300 text-lg">
                  No transactions found for this date
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </OptimizedLayout>
    );
  }

  return null;
};