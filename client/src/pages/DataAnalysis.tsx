import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UniversalLayout } from "@/components/layout/UniversalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from "date-fns";

interface AnalysisData {
  date: string;
  sales: number;
  expenses: number;
  profit: number;
  transactions: number;
}

interface WorkerAnalysis {
  workerId: string;
  workerEmail: string;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  averageTransactionValue: number;
}

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'composed';
type DurationFilter = 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'all';
type AnalysisType = 'all' | 'compare' | 'individual';

export const DataAnalysis = () => {
  const { user } = useAuth();
  const [analysisType, setAnalysisType] = useState<AnalysisType>('all');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [duration, setDuration] = useState<DurationFilter>('month');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [workerAnalysis, setWorkerAnalysis] = useState<WorkerAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];

  useEffect(() => {
    loadAnalysisData();
  }, [duration, analysisType, selectedWorkers]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      const transactions = LocalStorageDB.getTransactions();
      const users = LocalStorageDB.getUsers();
      
      // Filter transactions based on duration
      const filteredTransactions = filterTransactionsByDuration(transactions);
      
      // Generate analysis data
      const dataMap = new Map<string, AnalysisData>();
      const workerMap = new Map<string, WorkerAnalysis>();
      
      filteredTransactions.forEach(transaction => {
        const dateKey = getDateKey(new Date(transaction.timestamp));
        
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, {
            date: dateKey,
            sales: 0,
            expenses: 0,
            profit: 0,
            transactions: 0
          });
        }
        
        const data = dataMap.get(dateKey)!;
        data.transactions++;
        
        if (transaction.type === 'sale') {
          data.sales += transaction.totalAmount;
        } else if (transaction.type === 'expense') {
          data.expenses += transaction.amount;
        }
        
        data.profit = data.sales - data.expenses;
        
        // Worker analysis
        const workerId = transaction.workerId || 'unknown';
        const workerEmail = transaction.workerEmail || 'Unknown Worker';
        
        if (!workerMap.has(workerId)) {
          workerMap.set(workerId, {
            workerId,
            workerEmail,
            totalSales: 0,
            totalExpenses: 0,
            netProfit: 0,
            transactionCount: 0,
            averageTransactionValue: 0
          });
        }
        
        const worker = workerMap.get(workerId)!;
        worker.transactionCount++;
        
        if (transaction.type === 'sale') {
          worker.totalSales += transaction.totalAmount;
        } else if (transaction.type === 'expense') {
          worker.totalExpenses += transaction.amount;
        }
        
        worker.netProfit = worker.totalSales - worker.totalExpenses;
        worker.averageTransactionValue = worker.totalSales / worker.transactionCount;
      });
      
      setAnalysisData(Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date)));
      setWorkerAnalysis(Array.from(workerMap.values()));
      
    } catch (error) {
      console.error("Error loading analysis data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByDuration = (transactions: any[]) => {
    const now = new Date();
    let startDate: Date;
    
    switch (duration) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = startOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 6);
        break;
      case 'year':
        startDate = subMonths(now, 12);
        break;
      default:
        return transactions;
    }
    
    return transactions.filter(txn => new Date(txn.timestamp) >= startDate);
  };

  const getDateKey = (date: Date) => {
    switch (duration) {
      case 'today':
        return format(date, 'HH:mm');
      case 'week':
        return format(date, 'EEE');
      case 'month':
        return format(date, 'MMM dd');
      case '3months':
      case '6months':
        return format(date, 'MMM yyyy');
      case 'year':
        return format(date, 'MMM yyyy');
      default:
        return format(date, 'MMM yyyy');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    if (analysisData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No data available for the selected period
        </div>
      );
    }

    const chartProps = {
      data: analysisData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend />
              <Bar dataKey="sales" fill="#10B981" name="Sales" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Bar dataKey="profit" fill="#F59E0B" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} name="Sales" />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend />
              <Area type="monotone" dataKey="sales" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Sales" />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend />
              <Bar dataKey="sales" fill="#10B981" name="Sales" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={3} name="Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const totalSales = analysisData.reduce((sum, item) => sum + item.sales, 0);
        const totalExpenses = analysisData.reduce((sum, item) => sum + item.expenses, 0);
        const pieData = [
          { name: 'Sales', value: totalSales },
          { name: 'Expenses', value: totalExpenses }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const renderWorkerComparison = () => {
    if (selectedWorkers.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          Select workers to compare their performance
        </div>
      );
    }

    const comparisonData = workerAnalysis.filter(worker => 
      selectedWorkers.includes(worker.workerId)
    );

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={comparisonData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="workerEmail" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [formatCurrency(value), '']}
          />
          <Legend />
          <Bar dataKey="totalSales" fill="#10B981" name="Total Sales" />
          <Bar dataKey="totalExpenses" fill="#EF4444" name="Total Expenses" />
          <Bar dataKey="netProfit" fill="#F59E0B" name="Net Profit" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (user?.role !== 'owner') {
    return (
      <UniversalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-white">Access denied. Only owners can view data analysis.</p>
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
            Data Analysis
          </h1>
          <Button
            onClick={loadAnalysisData}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Analysis Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              analysisType === 'all' 
                ? 'bg-orange-500/20 border-orange-500' 
                : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}
            onClick={() => setAnalysisType('all')}
          >
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-orange-500" />
              <h3 className="text-white font-semibold mb-2">All Workers Data</h3>
              <p className="text-gray-300 text-sm">
                Complete analysis of all workers' performance
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              analysisType === 'compare' 
                ? 'bg-orange-500/20 border-orange-500' 
                : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}
            onClick={() => setAnalysisType('compare')}
          >
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-orange-500" />
              <h3 className="text-white font-semibold mb-2">Compare Workers</h3>
              <p className="text-gray-300 text-sm">
                Side-by-side comparison of worker performance
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              analysisType === 'individual' 
                ? 'bg-orange-500/20 border-orange-500' 
                : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}
            onClick={() => setAnalysisType('individual')}
          >
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-orange-500" />
              <h3 className="text-white font-semibold mb-2">Individual Analysis</h3>
              <p className="text-gray-300 text-sm">
                Detailed analysis of specific worker data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Select value={duration} onValueChange={(value: DurationFilter) => setDuration(value)}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="composed">Combined Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analysisType === 'compare' && (
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <Select 
                value={selectedWorkers.join(',')} 
                onValueChange={(value) => setSelectedWorkers(value.split(',').filter(Boolean))}
              >
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select workers" />
                </SelectTrigger>
                <SelectContent>
                  {workerAnalysis.map(worker => (
                    <SelectItem key={worker.workerId} value={worker.workerId}>
                      {worker.workerEmail}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Chart Display */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>
                {analysisType === 'all' && 'Overall Performance Analysis'}
                {analysisType === 'compare' && 'Worker Comparison'}
                {analysisType === 'individual' && 'Individual Worker Analysis'}
              </span>
              <Badge variant="outline" className="border-white/30 text-white">
                {duration.charAt(0).toUpperCase() + duration.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisType === 'compare' ? renderWorkerComparison() : renderChart()}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {analysisData.length > 0 && (
            <>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 text-xl font-bold">
                    {formatCurrency(analysisData.reduce((sum, item) => sum + item.sales, 0))}
                  </p>
                  <p className="text-gray-300 text-sm">Total Sales</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <p className="text-red-400 text-xl font-bold">
                    {formatCurrency(analysisData.reduce((sum, item) => sum + item.expenses, 0))}
                  </p>
                  <p className="text-gray-300 text-sm">Total Expenses</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-400 text-xl font-bold">
                    {formatCurrency(analysisData.reduce((sum, item) => sum + item.profit, 0))}
                  </p>
                  <p className="text-gray-300 text-sm">Net Profit</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-400 text-xl font-bold">
                    {analysisData.reduce((sum, item) => sum + item.transactions, 0)}
                  </p>
                  <p className="text-gray-300 text-sm">Total Transactions</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </UniversalLayout>
  );
};