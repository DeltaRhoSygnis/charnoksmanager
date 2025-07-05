import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { LocalStorageDB } from '@/lib/localStorageDB';
import { OfflineState } from '@/lib/offlineState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Receipt, DollarSign } from 'lucide-react';


const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  notes?: string;
  workerEmail?: string;
  timestamp: Date;
}

interface FirestoreExpenseData {
  description: string;
  amount: number;
  category: string;
  notes?: string;
  workerEmail?: string;
  workerId?: string;
  timestamp?: {
    toDate: () => Date;
  };
}

const expenseCategories = [
  'Supplies',
  'Utilities',
  'Rent',
  'Transportation',
  'Food & Beverages',
  'Maintenance',
  'Marketing',
  'Insurance',
  'Miscellaneous'
];

export const RecordExpense = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Use simpler query to avoid index requirements
      let expensesQuery;
      
      if (user?.role === 'owner') {
        // Owner sees all expenses (simple query)
        expensesQuery = query(collection(db, 'expenses'));
      } else {
        // Worker sees only their expenses (simple query)
        expensesQuery = query(
          collection(db, 'expenses'),
          where('workerEmail', '==', user?.email)
        );
      }
      
      const snapshot = await getDocs(expensesQuery);
      const expensesData = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreExpenseData;
        return {
          id: doc.id,
          description: data.description,
          amount: data.amount,
          category: data.category,
          notes: data.notes,
          workerEmail: data.workerEmail,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      }) as Expense[];
      
      // Filter for today's expenses on client side
      const todayExpenses = expensesData.filter(expense => {
        return expense.timestamp >= today;
      });
      
      // Sort by timestamp descending
      todayExpenses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setExpenses(todayExpenses);
      
      const total = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(total);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      setTotalExpenses(0);
      toast({
        title: "Error",
        description: "Failed to fetch expenses. Using offline mode.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const expenseData = {
        ...data,
        timestamp: new Date(),
        workerEmail: user?.email,
        workerId: user?.uid,
      };

      if (OfflineState.hasFirebaseAccess()) {
        await addDoc(collection(db, 'expenses'), expenseData);
        toast({
          title: "Success",
          description: "Expense recorded successfully",
        });
      } else {
        // Fallback to local storage
        LocalStorageDB.addTransaction({
          id: Date.now().toString(),
          items: [],
          totalAmount: data.amount,
          amountPaid: data.amount,
          change: 0,
          paymentMethod: "cash",
          workerId: user.uid,
          workerEmail: user.email,
          timestamp: new Date(),
          isVoiceTransaction: false,
          status: "completed",
        } as any);
        
        toast({
          title: "Success (Offline)",
          description: "Expense recorded locally",
        });
      }

      reset();
      fetchExpenses();
    } catch (error) {
      console.error('Error recording expense:', error);
      toast({
        title: "Error",
        description: "Failed to record expense. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Record Expense</h1>
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
            {user?.role?.toUpperCase()}: {user?.email}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense Form */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  New Expense
                </CardTitle>
                <CardDescription className="text-gray-300">Record a new business expense</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="e.g., Office supplies"
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-400 mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-white">Amount (₱)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...register('amount', { valueAsNumber: true })}
                      placeholder="0.00"
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-400 mt-1">{errors.amount.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">Category</Label>
                    <Select onValueChange={(value) => setValue('category', value)}>
                      <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-400 mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Additional details..."
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    {isLoading ? 'Recording...' : 'Record Expense'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Today's Summary and Expenses List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Summary */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <DollarSign className="h-5 w-5 mr-2" />
                  {user?.role === 'owner' ? "Today's Total Expenses" : "My Today's Expenses"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">
                  ₱{totalExpenses.toFixed(2)}
                </div>
                <p className="text-gray-300">{expenses.length} expense(s) recorded</p>
              </CardContent>
            </Card>

            {/* Expenses List */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Receipt className="h-5 w-5 mr-2" />
                  Recent Expenses
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {user?.role === 'owner' ? "All expense records for today" : "Your expense records for today"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No expenses recorded today
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20">
                        <TableHead className="text-gray-300">Description</TableHead>
                        <TableHead className="text-gray-300">Category</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        {user?.role === 'owner' && <TableHead className="text-gray-300">Worker</TableHead>}
                        <TableHead className="text-gray-300">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id} className="border-white/20">
                          <TableCell className="text-white">
                            <div>
                              <div className="font-medium">{expense.description}</div>
                              {expense.notes && (
                                <div className="text-sm text-gray-400">{expense.notes}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-red-400">
                            ₱{expense.amount.toFixed(2)}
                          </TableCell>
                          {user?.role === 'owner' && (
                            <TableCell className="text-sm text-gray-400">
                              {expense.workerEmail}
                            </TableCell>
                          )}
                          <TableCell className="text-sm text-gray-400">
                            {new Date(expense.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })}
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
    </div>
  );
};
