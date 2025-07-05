import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UniversalLayout } from "@/components/layout/UniversalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ScatterChart,
  Scatter
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
  RefreshCw,
  ArrowLeft,
  Target,
  Activity,
  Zap,
  GitCompare,
  User,
  Settings,
  DollarSign
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

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'composed' | 'radar' | 'treemap' | 'scatter';
type DurationFilter = 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'all';
type AnalysisMode = 'overview' | 'all-workers' | 'compare-workers' | 'individual-worker';

export const DataAnalysis = () => {
  const { user } = useAuth();
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('overview');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [duration, setDuration] = useState<DurationFilter>('month');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [workerAnalysis, setWorkerAnalysis] = useState<WorkerAnalysis[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#ff9f43', '#55a3ff', '#26d0ce'];

  useEffect(() => {
    loadAnalysisData();
  }, [duration, analysisMode, selectedWorkers, selectedWorker]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      const { DataService } = await import("@/lib/dataService");
      const transactions = await DataService.getTransactions();
      const users = LocalStorageDB.getUsers(); // Keep users local for now
      
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
            transactions: 0,
          });
        }
        
        const dayData = dataMap.get(dateKey)!;
        dayData.transactions++;
        
        if (transaction.type === 'sale') {
          const amount = transaction.totalAmount || transaction.amount || 0;
          dayData.sales += amount;
        } else if (transaction.type === 'expense') {
          const amount = transaction.amount || 0;
          dayData.expenses += amount;
        }
        
        dayData.profit = dayData.sales - dayData.expenses;
        
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
            averageTransactionValue: 0,
          });
        }
        
        const worker = workerMap.get(workerId)!;
        worker.transactionCount++;
        
        if (transaction.type === 'sale') {
          const amount = transaction.totalAmount || transaction.amount || 0;
          worker.totalSales += amount;
        } else if (transaction.type === 'expense') {
          const amount = transaction.amount || 0;
          worker.totalExpenses += amount;
        }
        
        worker.netProfit = worker.totalSales - worker.totalExpenses;
        worker.averageTransactionValue = worker.totalSales / Math.max(1, worker.transactionCount);
      });
      
      const analysisArray = Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const workerArray = Array.from(workerMap.values()).sort((a, b) => b.totalSales - a.totalSales);
      
      setAnalysisData(analysisArray);
      setWorkerAnalysis(workerArray);
      
      // Generate comparison data for selected workers
      if (selectedWorkers.length > 0) {
        const comparison = selectedWorkers.map(workerId => {
          const worker = workerArray.find(w => w.workerId === workerId);
          return worker || { workerId, workerEmail: 'Unknown', totalSales: 0, totalExpenses: 0, netProfit: 0, transactionCount: 0, averageTransactionValue: 0 };
        });
        setComparisonData(comparison);
      }
      
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
    
    return transactions.filter(t => new Date(t.timestamp) >= startDate);
  };

  const getDateKey = (date: Date) => {
    if (duration === 'today') {
      return format(date, 'HH:00');
    } else if (duration === 'week') {
      return format(date, 'EEE');
    } else if (duration === 'month') {
      return format(date, 'MMM dd');
    } else {
      return format(date, 'MMM yyyy');
    }
  };

  const formatCurrency = (amount: number) => `₱${amount.toFixed(2)}`;

  const renderChart = (data: any[], type: ChartType = chartType) => {
    const commonProps = {
      width: '100%',
      height: 400,
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff30', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#4ade80" name="Sales" />
              <Bar dataKey="expenses" fill="#f87171" name="Expenses" />
              <Bar dataKey="profit" fill="#60a5fa" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff30', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#4ade80" strokeWidth={3} name="Sales" />
              <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={3} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#60a5fa" strokeWidth={3} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff30', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="sales" stackId="1" stroke="#4ade80" fill="#4ade80" fillOpacity={0.6} name="Sales" />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#f87171" fill="#f87171" fillOpacity={0.6} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = [
          { name: 'Sales', value: data.reduce((sum, item) => sum + item.sales, 0), fill: '#4ade80' },
          { name: 'Expenses', value: data.reduce((sum, item) => sum + item.expenses, 0), fill: '#f87171' }
        ];
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff30', borderRadius: '8px' }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="date" stroke="#ffffff80" />
              <YAxis stroke="#ffffff80" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff30', borderRadius: '8px' }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend />
              <Bar dataKey="transactions" fill="#a78bfa" name="Transactions" />
              <Line type="monotone" dataKey="sales" stroke="#4ade80" strokeWidth={3} name="Sales" />
              <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={3} name="Expenses" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart data={data.slice(0, 6)}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="date" className="text-white" />
              <PolarRadiusAxis stroke="#ffffff80" />
              <Radar name="Sales" dataKey="sales" stroke="#4ade80" fill="#4ade80" fillOpacity={0.6} />
              <Radar name="Expenses" dataKey="expenses" stroke="#f87171" fill="#f87171" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return renderChart(data, 'bar');
    }
  };

  if (loading) {
    return (
      <UniversalLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-16">
            <BarChart3 className="h-24 w-24 text-gray-500 mx-auto mb-6 opacity-50 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-4">Analyzing Data...</h3>
            <p className="text-gray-300 text-lg">Please wait while we process your analytics</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  // Analysis Overview - First Page
  if (analysisMode === 'overview') {
    return (
      <UniversalLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-white mb-2 charnoks-text">
              Data Analysis Center
            </h1>
            <p className="text-gray-300 text-xl">
              Advanced analytics and insights for your business performance
            </p>
          </div>

          {/* Analysis Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* All Workers Data Analysis */}
            <Card 
              className="bg-black/40 backdrop-blur-xl border-white/20 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setAnalysisMode('all-workers')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-blue-500/20 rounded-full p-6 mb-4 group-hover:bg-blue-500/30 transition-all">
                  <BarChart3 className="h-12 w-12 text-blue-400" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">All Workers Data</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-lg mb-6">
                  Comprehensive analysis of overall business performance with multiple chart types and visualizations
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Sales & Expense Trends</p>
                  <p>• Multiple Chart Types</p>
                  <p>• Time-based Analysis</p>
                  <p>• Performance Metrics</p>
                </div>
                <Button className="mt-6 bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Analyze All Data
                </Button>
              </CardContent>
            </Card>

            {/* Compare Workers Data */}
            <Card 
              className="bg-black/40 backdrop-blur-xl border-white/20 hover:border-green-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setAnalysisMode('compare-workers')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-green-500/20 rounded-full p-6 mb-4 group-hover:bg-green-500/30 transition-all">
                  <GitCompare className="h-12 w-12 text-green-400" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">Compare Workers</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-lg mb-6">
                  Side-by-side comparison of worker performance with customizable duration and metrics
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Worker vs Worker Analysis</p>
                  <p>• Performance Comparison</p>
                  <p>• Custom Date Ranges</p>
                  <p>• Ranking & Metrics</p>
                </div>
                <Button className="mt-6 bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30 w-full">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare Performance
                </Button>
              </CardContent>
            </Card>

            {/* Individual Worker Analysis */}
            <Card 
              className="bg-black/40 backdrop-blur-xl border-white/20 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setAnalysisMode('individual-worker')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-purple-500/20 rounded-full p-6 mb-4 group-hover:bg-purple-500/30 transition-all">
                  <User className="h-12 w-12 text-purple-400" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">Individual Worker</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-lg mb-6">
                  Deep dive into specific worker performance with detailed metrics and trends
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Personal Performance</p>
                  <p>• Detailed Breakdowns</p>
                  <p>• Historical Trends</p>
                  <p>• Goal Tracking</p>
                </div>
                <Button className="mt-6 bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30 w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Analyze Individual
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Active Workers</p>
                <p className="text-blue-400 font-bold text-2xl">{workerAnalysis.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Total Sales</p>
                <p className="text-green-400 font-bold text-2xl">
                  {formatCurrency(analysisData.reduce((sum, item) => sum + item.sales, 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6 text-center">
                <TrendingDown className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Total Expenses</p>
                <p className="text-red-400 font-bold text-2xl">
                  {formatCurrency(analysisData.reduce((sum, item) => sum + item.expenses, 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Transactions</p>
                <p className="text-purple-400 font-bold text-2xl">
                  {analysisData.reduce((sum, item) => sum + item.transactions, 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  // All Workers Data Analysis
  if (analysisMode === 'all-workers') {
    return (
      <UniversalLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setAnalysisMode('overview')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white charnoks-text">
                All Workers Data Analysis
              </h1>
              <p className="text-gray-300">Comprehensive business performance overview</p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <Label className="text-white mb-3 block">Chart Type</Label>
                <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="composed">Composed Chart</SelectItem>
                    <SelectItem value="radar">Radar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <Label className="text-white mb-3 block">Duration</Label>
                <Select value={duration} onValueChange={(value: DurationFilter) => setDuration(value)}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <Label className="text-white mb-3 block">Actions</Label>
                <div className="flex gap-2">
                  <Button 
                    onClick={loadAnalysisData}
                    size="sm"
                    className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-blue-400" />
                Business Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderChart(analysisData)}
            </CardContent>
          </Card>

          {/* Worker Performance Table */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-3">
                <Users className="h-6 w-6 text-green-400" />
                Worker Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-bold p-4">Worker</th>
                      <th className="text-right text-white font-bold p-4">Sales</th>
                      <th className="text-right text-white font-bold p-4">Expenses</th>
                      <th className="text-right text-white font-bold p-4">Net Profit</th>
                      <th className="text-right text-white font-bold p-4">Transactions</th>
                      <th className="text-right text-white font-bold p-4">Avg. Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workerAnalysis.map((worker, index) => (
                      <tr key={worker.workerId} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className={`border-${COLORS[index % COLORS.length]}/30 text-${COLORS[index % COLORS.length]}`}
                            >
                              #{index + 1}
                            </Badge>
                            <span className="text-white">{worker.workerEmail}</span>
                          </div>
                        </td>
                        <td className="text-right text-green-400 font-bold p-4">
                          {formatCurrency(worker.totalSales)}
                        </td>
                        <td className="text-right text-red-400 font-bold p-4">
                          {formatCurrency(worker.totalExpenses)}
                        </td>
                        <td className={`text-right font-bold p-4 ${worker.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(worker.netProfit)}
                        </td>
                        <td className="text-right text-blue-400 font-bold p-4">
                          {worker.transactionCount}
                        </td>
                        <td className="text-right text-purple-400 font-bold p-4">
                          {formatCurrency(worker.averageTransactionValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </UniversalLayout>
    );
  }

  // Compare Workers Mode
  if (analysisMode === 'compare-workers') {
    return (
      <UniversalLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setAnalysisMode('overview')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white charnoks-text">
                Compare Workers Performance
              </h1>
              <p className="text-gray-300">Side-by-side worker performance comparison</p>
            </div>
          </div>

          {/* Worker Selection */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-xl">Select Workers to Compare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workerAnalysis.map((worker) => (
                  <Card
                    key={worker.workerId}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedWorkers.includes(worker.workerId)
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      if (selectedWorkers.includes(worker.workerId)) {
                        setSelectedWorkers(selectedWorkers.filter(id => id !== worker.workerId));
                      } else if (selectedWorkers.length < 5) {
                        setSelectedWorkers([...selectedWorkers, worker.workerId]);
                      }
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <p className="text-white font-medium">{worker.workerEmail}</p>
                      <p className="text-gray-400 text-sm">{formatCurrency(worker.totalSales)} sales</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedWorkers.length > 5 && (
                <p className="text-yellow-400 text-sm mt-4">Maximum 5 workers can be compared at once</p>
              )}
            </CardContent>
          </Card>

          {/* Comparison Results */}
          {selectedWorkers.length > 1 && (
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <GitCompare className="h-6 w-6 text-green-400" />
                  Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(comparisonData.map((worker, index) => ({
                  name: worker.workerEmail.split('@')[0],
                  sales: worker.totalSales,
                  expenses: worker.totalExpenses,
                  profit: worker.netProfit,
                  transactions: worker.transactionCount
                })))}
              </CardContent>
            </Card>
          )}
        </div>
      </UniversalLayout>
    );
  }

  // Individual Worker Analysis
  if (analysisMode === 'individual-worker') {
    const worker = workerAnalysis.find(w => w.workerId === selectedWorker);
    
    return (
      <UniversalLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setAnalysisMode('overview')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white charnoks-text">
                Individual Worker Analysis
              </h1>
              <p className="text-gray-300">Detailed performance breakdown</p>
            </div>
          </div>

          {/* Worker Selection */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20">
            <CardContent className="p-6">
              <Label className="text-white mb-3 block">Select Worker</Label>
              <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                <SelectTrigger className="bg-white/10 border-white/30 text-white">
                  <SelectValue placeholder="Choose a worker to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {workerAnalysis.map((worker) => (
                    <SelectItem key={worker.workerId} value={worker.workerId}>
                      {worker.workerEmail}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Individual Analysis Results */}
          {worker && (
            <>
              {/* Worker Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-black/40 backdrop-blur-xl border-white/20">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Total Sales</p>
                    <p className="text-green-400 font-bold text-2xl">
                      {formatCurrency(worker.totalSales)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/40 backdrop-blur-xl border-white/20">
                  <CardContent className="p-6 text-center">
                    <TrendingDown className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Total Expenses</p>
                    <p className="text-red-400 font-bold text-2xl">
                      {formatCurrency(worker.totalExpenses)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/40 backdrop-blur-xl border-white/20">
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Net Profit</p>
                    <p className={`font-bold text-2xl ${worker.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(worker.netProfit)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/40 backdrop-blur-xl border-white/20">
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Avg. Transaction</p>
                    <p className="text-purple-400 font-bold text-2xl">
                      {formatCurrency(worker.averageTransactionValue)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Individual Performance Chart */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-3">
                    <User className="h-6 w-6 text-purple-400" />
                    {worker.workerEmail} Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChart([
                    { date: 'Sales', sales: worker.totalSales, expenses: 0, profit: worker.totalSales },
                    { date: 'Expenses', sales: 0, expenses: worker.totalExpenses, profit: -worker.totalExpenses },
                    { date: 'Net Profit', sales: 0, expenses: 0, profit: worker.netProfit },
                    { date: 'Transactions', sales: 0, expenses: 0, profit: worker.transactionCount }
                  ], 'bar')}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </UniversalLayout>
    );
  }

  return null;
};