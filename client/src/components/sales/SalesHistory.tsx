
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
    <div className="space-y-4 pb-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Sales History</h1>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-sm px-3 py-1">
          <TrendingUp className="h-4 w-4 mr-1" />
          Total: ₱{totalRevenue.toFixed(2)}
        </Badge>
      </div>

      <Card className="bg-black/40 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-white">
            <ShoppingCart className="h-5 w-5 mr-2" />
            All Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70">No sales recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="border border-white/20 rounded-lg p-4 bg-white/5 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-green-400 text-lg">
                        ₱{sale.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-white/60">
                        {formatDate(sale.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-white/30 text-white/80">
                      {sale.workerEmail}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {sale.items.map((item, index) => (
                      <div key={index} className="text-sm text-white/70">
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Sales History</h1>
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-lg px-4 py-2">
          <TrendingUp className="h-4 w-4 mr-2" />
          Total Revenue: ₱{totalRevenue.toFixed(2)}
        </Badge>
      </div>

      <Card className="bg-black/40 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <ShoppingCart className="h-5 w-5 mr-2" />
            All Sales Transactions
          </CardTitle>
          <CardDescription className="text-white/70">
            Complete history of all sales transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg">No sales recorded yet</p>
              <p className="text-white/50">Sales will appear here once workers start recording transactions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/80">Date & Time</TableHead>
                  <TableHead className="text-white/80">Worker</TableHead>
                  <TableHead className="text-white/80">Items</TableHead>
                  <TableHead className="text-white/80">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white/80">
                      {formatDate(sale.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-white/30 text-white/80">{sale.workerEmail}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sale.items.map((item, index) => (
                          <div key={index} className="text-sm text-white/70">
                            {item.quantity}x {item.name} - ₱{item.total.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-400">
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
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};
