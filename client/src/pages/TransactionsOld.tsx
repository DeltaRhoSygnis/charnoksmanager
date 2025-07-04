import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UniversalLayout } from "@/components/layout/UniversalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, DollarSign, TrendingUp, TrendingDown, Users, Search, Eye, Filter } from "lucide-react";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { format } from "date-fns";

// Using the unified Transaction type from types/product.ts
import { Transaction } from "@/types/product";

type WorkerTransaction = Transaction;

interface WorkerSummary {
  workerId: string;
  workerEmail: string;
  totalSales: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  lastActivity: Date;
}

export const Transactions = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<WorkerSummary[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [workerTransactions, setWorkerTransactions] = useState<WorkerTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkersData();
  }, []);

  const loadWorkersData = async () => {
    try {
      setLoading(true);
      const transactions = LocalStorageDB.getTransactions();
      const users = LocalStorageDB.getUsers();
      
      // Group transactions by worker
      const workerMap = new Map<string, WorkerSummary>();
      
      transactions.forEach(transaction => {
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
            lastActivity: new Date(transaction.timestamp)
          });
        }
        
        const worker = workerMap.get(workerId)!;
        
        // Handle different transaction types
        if (transaction.type === 'sale' && transaction.totalAmount) {
          worker.totalSales += transaction.totalAmount;
        } else if (transaction.type === 'expense' && transaction.amount) {
          worker.totalExpenses += transaction.amount;
        }
        
        worker.netAmount = worker.totalSales - worker.totalExpenses;
        worker.transactionCount++;
        
        if (new Date(transaction.timestamp) > worker.lastActivity) {
          worker.lastActivity = new Date(transaction.timestamp);
        }
      });
      
      setWorkers(Array.from(workerMap.values()));
    } catch (error) {
      console.error("Error loading workers data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkerTransactions = (workerId: string) => {
    const transactions = LocalStorageDB.getTransactions();
    const workerTxns = transactions.filter(txn => txn.workerId === workerId);
    setWorkerTransactions(workerTxns);
    setSelectedWorker(workerId);
  };

  const getDateTransactions = (date: string) => {
    const targetDate = new Date(date);
    return workerTransactions.filter(txn => {
      const txnDate = new Date(txn.timestamp);
      return txnDate.toDateString() === targetDate.toDateString();
    });
  };

  const filteredWorkers = workers.filter(worker =>
    worker.workerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatDateTime = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy - hh:mm a');
  };

  // Get unique dates for the selected worker
  const getWorkerDates = () => {
    if (!selectedWorker) return [];
    const dates = new Set<string>();
    workerTransactions.forEach(txn => {
      const date = new Date(txn.timestamp).toDateString();
      dates.add(date);
    });
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  if (user?.role !== 'owner') {
    return (
      <UniversalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-white">Access denied. Only owners can view transactions.</p>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  return (
    <UniversalLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white charnoks-text">
            Transaction Management
          </h1>
          <Button
            onClick={() => setSelectedWorker(null)}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Users className="h-4 w-4 mr-2" />
            All Workers
          </Button>
        </div>

        {!selectedWorker ? (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Workers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-white">Loading workers...</p>
                </div>
              ) : filteredWorkers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-white">No workers found.</p>
                </div>
              ) : (
                filteredWorkers.map((worker) => (
                  <Card
                    key={worker.workerId}
                    className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                    onClick={() => loadWorkerTransactions(worker.workerId)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-white font-semibold truncate">
                          {worker.workerEmail}
                        </span>
                        <Badge variant="outline" className="border-white/30 text-white">
                          {worker.transactionCount} txns
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                            <span className="text-xs text-gray-300">Sales</span>
                          </div>
                          <p className="text-green-400 font-semibold">
                            {formatCurrency(worker.totalSales)}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                            <span className="text-xs text-gray-300">Expenses</span>
                          </div>
                          <p className="text-red-400 font-semibold">
                            {formatCurrency(worker.totalExpenses)}
                          </p>
                        </div>
                      </div>
                      <div className="text-center pt-2 border-t border-white/20">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-300">Net Amount</span>
                        </div>
                        <p className={`font-bold ${worker.netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(worker.netAmount)}
                        </p>
                      </div>
                      <div className="text-center text-xs text-gray-400">
                        <CalendarDays className="h-3 w-3 inline mr-1" />
                        Last activity: {formatDate(worker.lastActivity)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <WorkerTransactionDetail
            worker={filteredWorkers.find(w => w.workerId === selectedWorker)!}
            transactions={workerTransactions}
            onBack={() => setSelectedWorker(null)}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </UniversalLayout>
  );
};

interface WorkerTransactionDetailProps {
  worker: WorkerSummary;
  transactions: WorkerTransaction[];
  onBack: () => void;
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
}

const WorkerTransactionDetail = ({ 
  worker, 
  transactions, 
  onBack, 
  onSelectDate, 
  selectedDate 
}: WorkerTransactionDetailProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy - hh:mm a');
  };

  // Get unique dates
  const getDates = () => {
    const dates = new Set<string>();
    transactions.forEach(txn => {
      const date = new Date(txn.timestamp).toDateString();
      dates.add(date);
    });
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  const getDateTransactions = (date: string) => {
    const targetDate = new Date(date);
    return transactions.filter(txn => {
      const txnDate = new Date(txn.timestamp);
      return txnDate.toDateString() === targetDate.toDateString();
    });
  };

  const displayTransactions = selectedDate ? getDateTransactions(selectedDate) : transactions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          ← Back to Workers
        </Button>
        <h2 className="text-2xl font-bold text-white">
          {worker.workerEmail}
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 text-2xl font-bold">
              {formatCurrency(worker.totalSales)}
            </p>
            <p className="text-gray-300 text-sm">Total Sales</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-2xl font-bold">
              {formatCurrency(worker.totalExpenses)}
            </p>
            <p className="text-gray-300 text-sm">Total Expenses</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className={`text-2xl font-bold ${worker.netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(worker.netAmount)}
            </p>
            <p className="text-gray-300 text-sm">Net Amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => onSelectDate(null)}
          variant={selectedDate ? "outline" : "default"}
          className={selectedDate ? "border-white/30 text-white hover:bg-white/10" : ""}
        >
          All Dates
        </Button>
        {getDates().map(date => (
          <Button
            key={date}
            onClick={() => onSelectDate(date)}
            variant={selectedDate === date ? "default" : "outline"}
            className={selectedDate !== date ? "border-white/30 text-white hover:bg-white/10" : ""}
          >
            {format(new Date(date), 'MMM dd')}
          </Button>
        ))}
      </div>

      {/* Transactions List */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">
            {selectedDate ? `Transactions for ${format(new Date(selectedDate), 'MMM dd, yyyy')}` : 'All Transactions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No transactions found for the selected date.
            </div>
          ) : (
            <div className="space-y-4">
              {displayTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'sale' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <p className="text-white font-medium">
                        {transaction.type === 'sale' ? 'Sale' : 'Expense'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDateTime(transaction.timestamp)}
                      </p>
                      {transaction.description && (
                        <p className="text-gray-300 text-sm mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'sale' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'sale' ? '+' : '-'}
                      {formatCurrency(transaction.type === 'sale' ? (transaction.totalAmount || 0) : (transaction.amount || 0))}
                    </p>
                    {transaction.items && transaction.items.length > 0 && (
                      <p className="text-gray-400 text-sm">
                        {transaction.items.length} items
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};