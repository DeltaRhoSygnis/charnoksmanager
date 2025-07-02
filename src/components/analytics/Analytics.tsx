import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CalendarDays, TrendingUp, DollarSign } from 'lucide-react';
import { Sale } from '@/types/sales';

interface SaleData {
  date: string;
  sales: number;
  transactions: number;
}

export const Analytics = () => {
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [period, setPeriod] = useState('7'); // days
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [averageOrder, setAverageOrder] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const salesQuery = query(
        collection(db, 'sales'),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(salesQuery);
      const sales: Sale[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          items: data.items || [],
          total: data.total || 0,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });

      // Group sales by date
      const salesByDate: { [key: string]: { sales: number; transactions: number } } = {};
      
      sales.forEach(sale => {
        const dateKey = sale.timestamp.toDateString();
        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = { sales: 0, transactions: 0 };
        }
        salesByDate[dateKey].sales += sale.total;
        salesByDate[dateKey].transactions += 1;
      });

      // Convert to array format for charts
      const chartData = Object.entries(salesByDate)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: data.sales,
          transactions: data.transactions
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setSalesData(chartData);

      // Calculate totals
      const totalSalesAmount = chartData.reduce((sum, day) => sum + day.sales, 0);
      const totalTransactionsCount = chartData.reduce((sum, day) => sum + day.transactions, 0);
      const avgOrder = totalTransactionsCount > 0 ? totalSalesAmount / totalTransactionsCount : 0;

      setTotalSales(totalSalesAmount);
      setTotalTransactions(totalTransactionsCount);
      setAverageOrder(avgOrder);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Last {period} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                Total orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{averageOrder.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales</CardTitle>
              <CardDescription>Sales revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₱${value}`, 'Sales']} />
                  <Bar dataKey="sales" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Trend</CardTitle>
              <CardDescription>Number of transactions per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Transactions']} />
                  <Line type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
