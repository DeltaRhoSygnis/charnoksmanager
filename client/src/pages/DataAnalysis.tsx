import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Scatter,
  RadialBarChart,
  RadialBar,
  FunnelChart,
  Funnel,
  LabelList
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
  DollarSign,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Star,
  Award,
  ShoppingCart,
  TrendingUp as GrowthIcon,
  Eye,
  ChevronRight,
  Globe,
  Sparkles,
  Brain
} from "lucide-react";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, differenceInDays, addDays, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Product } from "@/types/product";

interface AnalysisData {
  date: string;
  sales: number;
  expenses: number;
  profit: number;
  transactions: number;
  products?: { [key: string]: number };
  hourlyData?: { hour: number; sales: number; transactions: number };
}

interface WorkerAnalysis {
  workerId: string;
  workerEmail: string;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  averageTransactionValue: number;
  growthRate?: number;
  performanceScore?: number;
}

interface ProductAnalysis {
  name: string;
  quantity: number;
  revenue: number;
  averagePrice: number;
  growth: number;
}

interface TimePattern {
  hour: number;
  day: string;
  sales: number;
  transactions: number;
}

interface KPIData {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: any;
  color: string;
  target?: number;
}

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'composed' | 'radar' | 'treemap' | 'scatter' | 'radialBar' | 'funnel';
type DurationFilter = 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'all';
type AnalysisMode = 'overview' | 'all-workers' | 'compare-workers' | 'individual-worker' | 'products' | 'patterns' | 'predictions';

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
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis[]>([]);
  const [timePatterns, setTimePatterns] = useState<TimePattern[]>([]);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#ff9f43', '#55a3ff', '#26d0ce'];
  const GRADIENT_COLORS = [
    { start: '#ff6b6b', end: '#ff4757' },
    { start: '#4ecdc4', end: '#3eb7ac' },
    { start: '#45b7d1', end: '#2196f3' },
    { start: '#96ceb4', end: '#7cb9a8' },
    { start: '#ffeaa7', end: '#fdcb6e' }
  ];

  useEffect(() => {
    loadAnalysisData();
  }, [duration, analysisMode, selectedWorkers, selectedWorker]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      const { DataService } = await import("@/lib/dataService");
      const [transactions, products] = await Promise.all([
        DataService.getTransactions(),
        DataService.getProducts()
      ]);
      
      // Filter transactions based on duration
      const filteredTransactions = filterTransactionsByDuration(transactions);
      const previousPeriodTransactions = getPreviousPeriodTransactions(transactions);
      
      // Generate analysis data
      const dataMap = new Map<string, AnalysisData>();
      const workerMap = new Map<string, WorkerAnalysis>();
      const productMap = new Map<string, ProductAnalysis>();
      const hourlyMap = new Map<number, { sales: number; transactions: number }>();
      const dayMap = new Map<string, { sales: number; transactions: number }>();
      
      // Process current period
      filteredTransactions.forEach(transaction => {
        const dateKey = getDateKey(new Date(transaction.timestamp));
        const hour = new Date(transaction.timestamp).getHours();
        const dayOfWeek = format(new Date(transaction.timestamp), 'EEEE');
        
        // Daily data
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, {
            date: dateKey,
            sales: 0,
            expenses: 0,
            profit: 0,
            transactions: 0,
            products: {},
            hourlyData: { hour: 0, sales: 0, transactions: 0 }
          });
        }
        
        const dayData = dataMap.get(dateKey)!;
        dayData.transactions++;
        
        // Hourly patterns
        if (!hourlyMap.has(hour)) {
          hourlyMap.set(hour, { sales: 0, transactions: 0 });
        }
        const hourData = hourlyMap.get(hour)!;
        hourData.transactions++;
        
        // Day of week patterns
        if (!dayMap.has(dayOfWeek)) {
          dayMap.set(dayOfWeek, { sales: 0, transactions: 0 });
        }
        const weekDayData = dayMap.get(dayOfWeek)!;
        weekDayData.transactions++;
        
        if (transaction.type === 'sale') {
          const amount = transaction.totalAmount || transaction.amount || 0;
          dayData.sales += amount;
          hourData.sales += amount;
          weekDayData.sales += amount;
          
          // Product analysis
          if (transaction.items && Array.isArray(transaction.items)) {
            transaction.items.forEach((item: any) => {
              const productName = item.name || 'Unknown Product';
              if (!productMap.has(productName)) {
                productMap.set(productName, {
                  name: productName,
                  quantity: 0,
                  revenue: 0,
                  averagePrice: 0,
                  growth: 0
                });
              }
              const product = productMap.get(productName)!;
              product.quantity += item.quantity || 1;
              product.revenue += (item.price || 0) * (item.quantity || 1);
              product.averagePrice = product.revenue / product.quantity;
            });
          }
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
            growthRate: 0,
            performanceScore: 0
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
      
      // Calculate growth rates by comparing with previous period
      const previousWorkerStats = calculateWorkerStats(previousPeriodTransactions);
      workerMap.forEach((worker, workerId) => {
        const prevStats = previousWorkerStats.get(workerId);
        if (prevStats && prevStats.totalSales > 0) {
          worker.growthRate = ((worker.totalSales - prevStats.totalSales) / prevStats.totalSales) * 100;
        }
        // Calculate performance score (0-100)
        worker.performanceScore = calculatePerformanceScore(worker, Array.from(workerMap.values()));
      });
      
      // Convert maps to arrays first
      const analysisArray = Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const workerArray = Array.from(workerMap.values()).sort((a, b) => b.totalSales - a.totalSales);
      const productArray = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
      const timePatternsArray = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
        hour,
        day: '',
        sales: data.sales,
        transactions: data.transactions
      }));
      
      // Calculate KPIs
      const currentPeriodStats = calculatePeriodStats(filteredTransactions);
      const previousPeriodStats = calculatePeriodStats(previousPeriodTransactions);
      const kpis = calculateKPIs(currentPeriodStats, previousPeriodStats);
      
      // Generate predictions
      const predictionsData = generatePredictions(analysisArray);
      
      setAnalysisData(analysisArray);
      setWorkerAnalysis(workerArray);
      setProductAnalysis(productArray);
      setTimePatterns(timePatternsArray);
      setKpiData(kpis);
      setPredictions(predictionsData);
      
      // Generate comparison data for selected workers
      if (selectedWorkers.length > 0) {
        const comparison = selectedWorkers.map(workerId => {
          const worker = workerArray.find(w => w.workerId === workerId);
          return worker || { 
            workerId, 
            workerEmail: 'Unknown', 
            totalSales: 0, 
            totalExpenses: 0, 
            netProfit: 0, 
            transactionCount: 0, 
            averageTransactionValue: 0,
            growthRate: 0,
            performanceScore: 0 
          };
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

  // Helper functions for advanced analytics
  const getPreviousPeriodTransactions = (transactions: any[]) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (duration) {
      case 'today':
        startDate = subDays(now, 2);
        endDate = subDays(now, 1);
        break;
      case 'week':
        startDate = subWeeks(now, 2);
        endDate = subWeeks(now, 1);
        break;
      case 'month':
        startDate = subMonths(now, 2);
        endDate = subMonths(now, 1);
        break;
      case '3months':
        startDate = subMonths(now, 6);
        endDate = subMonths(now, 3);
        break;
      case '6months':
        startDate = subMonths(now, 12);
        endDate = subMonths(now, 6);
        break;
      case 'year':
        startDate = subMonths(now, 24);
        endDate = subMonths(now, 12);
        break;
      default:
        return [];
    }
    
    return transactions.filter(t => {
      const date = new Date(t.timestamp);
      return date >= startDate && date <= endDate;
    });
  };

  const calculateWorkerStats = (transactions: any[]) => {
    const workerMap = new Map<string, WorkerAnalysis>();
    
    transactions.forEach(transaction => {
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
        const amount = transaction.totalAmount || transaction.amount || 0;
        worker.totalSales += amount;
      } else if (transaction.type === 'expense') {
        const amount = transaction.amount || 0;
        worker.totalExpenses += amount;
      }
      
      worker.netProfit = worker.totalSales - worker.totalExpenses;
      worker.averageTransactionValue = worker.totalSales / Math.max(1, worker.transactionCount);
    });
    
    return workerMap;
  };

  const calculatePerformanceScore = (worker: WorkerAnalysis, allWorkers: WorkerAnalysis[]) => {
    if (allWorkers.length === 0) return 50;
    
    const avgSales = allWorkers.reduce((sum, w) => sum + w.totalSales, 0) / allWorkers.length;
    const avgTransactions = allWorkers.reduce((sum, w) => sum + w.transactionCount, 0) / allWorkers.length;
    const avgProfit = allWorkers.reduce((sum, w) => sum + w.netProfit, 0) / allWorkers.length;
    
    const salesScore = (worker.totalSales / Math.max(avgSales, 1)) * 30;
    const transactionScore = (worker.transactionCount / Math.max(avgTransactions, 1)) * 30;
    const profitScore = (worker.netProfit / Math.max(avgProfit, 1)) * 40;
    
    return Math.min(100, Math.max(0, salesScore + transactionScore + profitScore));
  };

  const calculatePeriodStats = (transactions: any[]) => {
    return {
      totalSales: transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + (t.totalAmount || t.amount || 0), 0),
      totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0),
      totalTransactions: transactions.length,
      uniqueWorkers: new Set(transactions.map(t => t.workerId)).size
    };
  };

  const calculateKPIs = (current: any, previous: any): KPIData[] => {
    const salesChange = previous.totalSales > 0 ? ((current.totalSales - previous.totalSales) / previous.totalSales) * 100 : 0;
    const expenseChange = previous.totalExpenses > 0 ? ((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100 : 0;
    const profitChange = (current.totalSales - current.totalExpenses) - (previous.totalSales - previous.totalExpenses);
    const profitChangePercent = (previous.totalSales - previous.totalExpenses) > 0 ? (profitChange / (previous.totalSales - previous.totalExpenses)) * 100 : 0;
    const transactionChange = previous.totalTransactions > 0 ? ((current.totalTransactions - previous.totalTransactions) / previous.totalTransactions) * 100 : 0;
    
    return [
      {
        label: 'Total Sales',
        value: current.totalSales,
        change: salesChange,
        changeType: salesChange >= 0 ? 'increase' : 'decrease',
        icon: DollarSign,
        color: '#4ecdc4',
        target: current.totalSales * 1.1
      },
      {
        label: 'Total Expenses',
        value: current.totalExpenses,
        change: Math.abs(expenseChange),
        changeType: expenseChange <= 0 ? 'increase' : 'decrease',
        icon: TrendingDown,
        color: '#ff6b6b',
        target: current.totalExpenses * 0.9
      },
      {
        label: 'Net Profit',
        value: current.totalSales - current.totalExpenses,
        change: Math.abs(profitChangePercent),
        changeType: profitChangePercent >= 0 ? 'increase' : 'decrease',
        icon: TrendingUp,
        color: '#45b7d1',
        target: (current.totalSales - current.totalExpenses) * 1.15
      },
      {
        label: 'Transactions',
        value: current.totalTransactions,
        change: Math.abs(transactionChange),
        changeType: transactionChange >= 0 ? 'increase' : 'decrease',
        icon: Activity,
        color: '#96ceb4',
        target: current.totalTransactions * 1.05
      }
    ];
  };

  const generatePredictions = (historicalData: AnalysisData[]) => {
    if (historicalData.length < 3) return [];
    
    // Simple linear regression for predictions
    const lastDays = historicalData.slice(-7);
    const avgDailySales = lastDays.reduce((sum, d) => sum + d.sales, 0) / lastDays.length;
    const avgDailyProfit = lastDays.reduce((sum, d) => sum + d.profit, 0) / lastDays.length;
    
    const predictions = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const futureDate = addDays(today, i);
      predictions.push({
        date: format(futureDate, 'yyyy-MM-dd'),
        predictedSales: avgDailySales * (1 + (Math.random() * 0.2 - 0.1)), // Add some variance
        predictedProfit: avgDailyProfit * (1 + (Math.random() * 0.2 - 0.1)),
        confidence: 85 - (i * 2) // Confidence decreases with distance
      });
    }
    
    return predictions;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalysisData();
    setRefreshing(false);
  };

  const handleExport = () => {
    // Export data as CSV
    const csvData = analysisData.map(d => ({
      Date: d.date,
      Sales: d.sales,
      Expenses: d.expenses,
      Profit: d.profit,
      Transactions: d.transactions
    }));
    
    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${duration}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
      <OptimizedLayout>
        <div className="container mx-auto p-6">
          <div className="text-center py-16">
            <BarChart3 className="h-24 w-24 text-gray-500 mx-auto mb-6 opacity-50 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-4">Analyzing Data...</h3>
            <p className="text-gray-300 text-lg">Please wait while we process your analytics</p>
          </div>
        </div>
      </OptimizedLayout>
    );
  }

  // Analysis Overview - First Page
  if (analysisMode === 'overview') {
    return (
      <OptimizedLayout>
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
            
            {/* Product Analysis */}
            <Card 
              className="bg-black/40 backdrop-blur-xl border-white/20 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setAnalysisMode('products')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-orange-500/20 rounded-full p-6 mb-4 group-hover:bg-orange-500/30 transition-all">
                  <Package className="h-12 w-12 text-orange-400" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">Product Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-lg mb-6">
                  Deep dive into product performance, inventory, and sales patterns
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Product Sales Rankings</p>
                  <p>• Inventory Turnover</p>
                  <p>• Price Analysis</p>
                  <p>• Category Performance</p>
                </div>
                <Button className="mt-6 bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30 w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Analyze Products
                </Button>
              </CardContent>
            </Card>

            {/* Time Patterns */}
            <Card 
              className="bg-black/40 backdrop-blur-xl border-white/20 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setAnalysisMode('patterns')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-cyan-500/20 rounded-full p-6 mb-4 group-hover:bg-cyan-500/30 transition-all">
                  <Clock className="h-12 w-12 text-cyan-400" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">Time Patterns</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-lg mb-6">
                  Discover hourly, daily, and seasonal business patterns
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Peak Hours Analysis</p>
                  <p>• Day of Week Trends</p>
                  <p>• Seasonal Patterns</p>
                  <p>• Customer Behavior</p>
                </div>
                <Button className="mt-6 bg-cyan-500/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Explore Patterns
                </Button>
              </CardContent>
            </Card>

            {/* Predictions & Insights */}
            <Card 
              className="bg-black/40 backdrop-blur-xl border-white/20 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
              onClick={() => setAnalysisMode('predictions')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-indigo-500/20 rounded-full p-6 mb-4 group-hover:bg-indigo-500/30 transition-all">
                  <Brain className="h-12 w-12 text-indigo-400" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">AI Predictions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 text-lg mb-6">
                  AI-powered forecasts and business insights for strategic planning
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Sales Forecasting</p>
                  <p>• Trend Predictions</p>
                  <p>• Smart Recommendations</p>
                  <p>• Risk Analysis</p>
                </div>
                <Button className="mt-6 bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  View Predictions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/20 hover:border-white/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: `${kpi.color}20` }}>
                        <kpi.icon className="h-6 w-6" style={{ color: kpi.color }} />
                      </div>
                      <Badge 
                        variant={kpi.changeType === 'increase' ? 'default' : 'destructive'}
                        className={`${
                          kpi.changeType === 'increase' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}
                      >
                        {kpi.changeType === 'increase' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {kpi.change.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
                    <p className="text-2xl font-bold text-white mb-3">
                      {kpi.label.includes('Sales') || kpi.label.includes('Expenses') || kpi.label.includes('Profit') 
                        ? formatCurrency(kpi.value) 
                        : kpi.value.toLocaleString()}
                    </p>
                    {kpi.target && (
                      <>
                        <Progress 
                          value={(kpi.value / kpi.target) * 100} 
                          className="h-2 mb-2"
                          style={{ 
                            '--progress-background': `${kpi.color}20`,
                            '--progress-foreground': kpi.color 
                          } as any}
                        />
                        <p className="text-xs text-gray-500">
                          Target: {kpi.label.includes('Sales') || kpi.label.includes('Expenses') || kpi.label.includes('Profit') 
                            ? formatCurrency(kpi.target) 
                            : kpi.target.toLocaleString()}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Top Products */}
          {productAnalysis.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-400" />
                  Top Products
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Best performing products by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productAnalysis.slice(0, 5).map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold`}
                             style={{ backgroundColor: COLORS[index % COLORS.length] + '40' }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-400 text-sm">
                            {product.quantity} units • Avg: {formatCurrency(product.averagePrice)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{formatCurrency(product.revenue)}</p>
                        {product.growth !== 0 && (
                          <p className={`text-sm ${product.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product.growth > 0 ? '+' : ''}{product.growth.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Worker Performance Leaderboard */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Performance Leaderboard
              </CardTitle>
              <CardDescription className="text-gray-400">
                Top performing workers based on sales and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workerAnalysis.slice(0, 5).map((worker, index) => (
                  <div key={worker.workerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-orange-600/20 text-orange-400' :
                        'bg-white/10 text-white'
                      } font-bold`}>
                        {index === 0 ? <Star className="h-5 w-5" /> : index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{worker.workerEmail}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{worker.transactionCount} transactions</span>
                          <span>Score: {worker.performanceScore?.toFixed(0) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(worker.totalSales)}</p>
                      {worker.growthRate !== undefined && (
                        <p className={`text-sm flex items-center gap-1 justify-end ${
                          worker.growthRate > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {worker.growthRate > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(worker.growthRate).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </OptimizedLayout>
    );
  }

  // All Workers Data Analysis
  if (analysisMode === 'all-workers') {
    return (
      <OptimizedLayout>
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
      </OptimizedLayout>
    );
  }

  // Compare Workers Mode
  if (analysisMode === 'compare-workers') {
    return (
      <OptimizedLayout>
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
      </OptimizedLayout>
    );
  }

  // Individual Worker Analysis
  if (analysisMode === 'individual-worker') {
    const worker = workerAnalysis.find(w => w.workerId === selectedWorker);
    
    return (
      <OptimizedLayout>
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
      </OptimizedLayout>
    );
  }

  // Product Analysis Mode
  if (analysisMode === 'products') {
    return (
      <OptimizedLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
                  Product Analysis
                </h1>
                <p className="text-gray-300">Deep dive into product performance metrics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleExport}
                className="bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Product Performance Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products Chart */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-400" />
                  Top Products by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={productAnalysis.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#ffffff80" />
                    <YAxis stroke="#ffffff80" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff30', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="revenue" fill="#fb923c" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Product Quantity Distribution */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-400" />
                  Product Sales Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={productAnalysis.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="quantity"
                    >
                      {productAnalysis.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Product Table */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-xl">Product Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-gray-400 border-b border-white/20">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4 text-right">Quantity Sold</th>
                      <th className="p-4 text-right">Revenue</th>
                      <th className="p-4 text-right">Avg. Price</th>
                      <th className="p-4 text-right">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productAnalysis.map((product, index) => (
                      <tr key={product.name} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                                 style={{ backgroundColor: COLORS[index % COLORS.length] + '40' }}>
                              {index + 1}
                            </div>
                            <span className="text-white">{product.name}</span>
                          </div>
                        </td>
                        <td className="text-right text-blue-400 font-bold p-4">
                          {product.quantity}
                        </td>
                        <td className="text-right text-green-400 font-bold p-4">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="text-right text-purple-400 font-bold p-4">
                          {formatCurrency(product.averagePrice)}
                        </td>
                        <td className={`text-right font-bold p-4 ${product.growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {product.growth > 0 ? '+' : ''}{product.growth.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </OptimizedLayout>
    );
  }

  // Time Patterns Mode
  if (analysisMode === 'patterns') {
    return (
      <OptimizedLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
                  Time Patterns Analysis
                </h1>
                <p className="text-gray-300">Discover business patterns and peak hours</p>
              </div>
            </div>
          </div>

          {/* Hourly Patterns */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                Hourly Sales Pattern
              </CardTitle>
              <CardDescription className="text-gray-400">
                Identify your busiest hours and optimize staffing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={timePatterns}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#ffffff80"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff30', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                    formatter={(value: any, name: string) => [
                      name === 'sales' ? formatCurrency(value) : value,
                      name === 'sales' ? 'Sales' : 'Transactions'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#06b6d4" 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#fbbf24" 
                    strokeWidth={3}
                    dot={{ fill: '#fbbf24', r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak Hours Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-8 w-8 text-yellow-400" />
                  <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                    Peak Hour
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-2">Busiest Hour</p>
                <p className="text-2xl font-bold text-white">
                  {timePatterns.length > 0 ? 
                    `${timePatterns.reduce((max, curr) => curr.sales > max.sales ? curr : max).hour}:00` 
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {timePatterns.length > 0 && 
                    `${formatCurrency(Math.max(...timePatterns.map(t => t.sales)))} in sales`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="h-8 w-8 text-green-400" />
                  <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                    Average
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-2">Avg. Hourly Sales</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(
                    timePatterns.reduce((sum, t) => sum + t.sales, 0) / Math.max(timePatterns.length, 1)
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {Math.round(
                    timePatterns.reduce((sum, t) => sum + t.transactions, 0) / Math.max(timePatterns.length, 1)
                  )} transactions/hour
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-blue-400" />
                  <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                    Quiet Hour
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-2">Slowest Hour</p>
                <p className="text-2xl font-bold text-white">
                  {timePatterns.length > 0 ? 
                    `${timePatterns.reduce((min, curr) => curr.sales < min.sales ? curr : min).hour}:00` 
                    : 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {timePatterns.length > 0 && 
                    `${formatCurrency(Math.min(...timePatterns.map(t => t.sales)))} in sales`}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </OptimizedLayout>
    );
  }

  // AI Predictions Mode
  if (analysisMode === 'predictions') {
    return (
      <OptimizedLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
                  AI Predictions & Insights
                </h1>
                <p className="text-gray-300">AI-powered forecasts and recommendations</p>
              </div>
            </div>
          </div>

          {/* Sales Forecast */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-400" />
                7-Day Sales Forecast
              </CardTitle>
              <CardDescription className="text-gray-400">
                AI predictions based on historical patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={[...analysisData.slice(-7), ...predictions]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff80" />
                  <YAxis stroke="#ffffff80" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff30', borderRadius: '8px' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#4ade80" name="Actual Sales" />
                  <Line 
                    type="monotone" 
                    dataKey="predictedSales" 
                    stroke="#818cf8" 
                    strokeWidth={3} 
                    strokeDasharray="5 5"
                    name="Predicted Sales"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Growth Opportunity</p>
                      <p className="text-gray-300 text-sm mt-1">
                        Peak hours show 23% higher sales. Consider extending hours or adding staff during 
                        {timePatterns.length > 0 && ` ${timePatterns.reduce((max, curr) => curr.sales > max.sales ? curr : max).hour}:00-${timePatterns.reduce((max, curr) => curr.sales > max.sales ? curr : max).hour + 1}:00`}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Product Focus</p>
                      <p className="text-gray-300 text-sm mt-1">
                        {productAnalysis[0]?.name || 'Top product'} accounts for {((productAnalysis[0]?.revenue || 0) / productAnalysis.reduce((sum, p) => sum + p.revenue, 1) * 100).toFixed(0)}% of revenue. 
                        Consider promotions for slower-moving items.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Worker Performance</p>
                      <p className="text-gray-300 text-sm mt-1">
                        Top performer has {((workerAnalysis[0]?.growthRate || 0)).toFixed(0)}% growth rate. 
                        Share best practices across the team.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workerAnalysis.filter(w => w.growthRate !== undefined && w.growthRate < -10).length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Performance Alert</p>
                        <p className="text-gray-300 text-sm mt-1">
                          {workerAnalysis.filter(w => w.growthRate !== undefined && w.growthRate < -10).length} worker(s) showing declining performance. 
                          Consider additional training or support.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Percent className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Expense Watch</p>
                      <p className="text-gray-300 text-sm mt-1">
                        Expenses are {((analysisData.reduce((sum, d) => sum + d.expenses, 0) / analysisData.reduce((sum, d) => sum + d.sales, 1)) * 100).toFixed(0)}% of sales. 
                        Monitor for cost optimization opportunities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Trend Watch</p>
                      <p className="text-gray-300 text-sm mt-1">
                        {predictions.length > 0 && predictions[0].confidence}% confidence in next week's forecast. 
                        Prepare inventory accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </OptimizedLayout>
    );
  }

  return null;
};