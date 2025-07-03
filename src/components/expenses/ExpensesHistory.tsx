
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Receipt, TrendingDown } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  timestamp: Date;
  workerEmail?: string;
}

export const ExpensesHistory = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const expensesQuery = query(
        collection(db, 'expenses'),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(expensesQuery);
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Expense[];
      
      setExpenses(expensesData);
      
      const total = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(total);
    } catch (error) {
      console.error('Error fetching expenses:', error);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Expenses History</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          <TrendingDown className="h-4 w-4 mr-1" />
          Total: ₱{totalExpenses.toFixed(2)}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Receipt className="h-5 w-5 mr-2" />
            All Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No expenses recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-red-600 text-lg">
                        ₱{expense.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(expense.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{expense.description}</p>
                  {expense.workerEmail ? (
                    <Badge variant="secondary" className="text-xs">
                      {expense.workerEmail}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-500">Owner</span>
                  )}
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
          <h1 className="text-3xl font-bold text-gray-900">Expenses History</h1>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <TrendingDown className="h-4 w-4 mr-2" />
            Total Expenses: ₱{totalExpenses.toFixed(2)}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              All Expense Records
            </CardTitle>
            <CardDescription>
              Complete history of all business expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No expenses recorded yet</p>
                <p className="text-gray-400">Expenses will appear here once they are recorded</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {formatDate(expense.timestamp)}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {expense.workerEmail ? (
                          <Badge variant="secondary">{expense.workerEmail}</Badge>
                        ) : (
                          <span className="text-gray-500">Owner</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        ₱{expense.amount.toFixed(2)}
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
