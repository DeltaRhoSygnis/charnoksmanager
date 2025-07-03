
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, TrendingUp } from 'lucide-react';

interface Sale {
  id: string;
  items: Array<{ name: string; quantity: number; price: number; total: number }>;
  total: number;
  timestamp: Date;
  workerEmail: string;
  workerId: string;
}

export const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const salesQuery = query(
        collection(db, 'sales'),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(salesQuery);
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Sale[];
      
      setSales(salesData);
      
      const total = salesData.reduce((sum, sale) => sum + sale.total, 0);
      setTotalRevenue(total);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const MobileLayout = () => (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales History</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          <TrendingUp className="h-4 w-4 mr-1" />
          Total: ₱{totalRevenue.toFixed(2)}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            All Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No sales recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-green-600 text-lg">
                        ₱{sale.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sale.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {sale.workerEmail}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {sale.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {item.quantity}x {item.name} - ₱{item.total.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const DesktopLayout = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <TrendingUp className="h-4 w-4 mr-2" />
            Total Revenue: ₱{totalRevenue.toFixed(2)}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              All Sales Transactions
            </CardTitle>
            <CardDescription>
              Complete history of all sales transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No sales recorded yet</p>
                <p className="text-gray-400">Sales will appear here once workers start recording transactions</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {formatDate(sale.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.workerEmail}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {sale.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.name} - ₱{item.total.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₱{sale.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};
