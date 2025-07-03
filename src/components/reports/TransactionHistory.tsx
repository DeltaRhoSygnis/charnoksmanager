import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  collection,
  query,
  orderBy,
  getDocs,
  where,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OfflineState } from "@/lib/offlineState";
import { Transaction } from "@/types/product";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ShoppingCart,
  DollarSign,
  Mic,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";

export const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [workers, setWorkers] = useState<Array<{ id: string; email: string }>>(
    [],
  );
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    averageTransaction: 0,
    voiceTransactions: 0,
  });

  const itemsPerPage = 20;

  useEffect(() => {
    fetchTransactions();
    fetchWorkers();
  }, []);

  useEffect(() => {
    filterTransactions();
    calculateStats();
  }, [transactions, searchQuery, workerFilter, dateFilter, statusFilter]);

  const fetchTransactions = async () => {
    if (!user || !user.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const salesQuery = query(
        collection(db, "sales"),
        orderBy("timestamp", "desc"),
        limit(500), // Fetch recent 500 transactions
      );

      const snapshot = await getDocs(salesQuery);
      const transactionsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Transaction;
      });

      setTransactions(transactionsData);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      if (OfflineState.isNetworkError(error)) {
        OfflineState.setOnlineStatus(false);
        setTransactions([]); // Empty array for offline mode
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", "worker"),
      );
      const snapshot = await getDocs(usersQuery);
      const workersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || "",
      }));
      setWorkers(workersData);
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.workerEmail
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.items.some((item) =>
            item.productName.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          transaction.id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Worker filter
    if (workerFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.workerEmail === workerFilter,
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate: Date, endDate: Date;

      switch (dateFilter) {
        case "today":
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        default:
          startDate = new Date(0);
          endDate = now;
      }

      filtered = filtered.filter((transaction) =>
        isWithinInterval(transaction.timestamp, {
          start: startDate,
          end: endDate,
        }),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.status === statusFilter,
      );
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const calculateStats = () => {
    const total = filteredTransactions.length;
    const revenue = filteredTransactions.reduce(
      (sum, t) => sum + t.totalAmount,
      0,
    );
    const average = total > 0 ? revenue / total : 0;
    const voice = filteredTransactions.filter(
      (t) => t.isVoiceTransaction,
    ).length;

    setStats({
      totalTransactions: total,
      totalRevenue: revenue,
      averageTransaction: average,
      voiceTransactions: voice,
    });
  };

  const exportTransactions = () => {
    const csvContent = [
      // Header
      [
        "Date",
        "Time",
        "Worker",
        "Items",
        "Total",
        "Paid",
        "Change",
        "Type",
        "Status",
      ].join(","),
      // Data
      ...filteredTransactions.map((transaction) =>
        [
          format(transaction.timestamp, "yyyy-MM-dd"),
          format(transaction.timestamp, "HH:mm:ss"),
          transaction.workerEmail,
          transaction.items
            .map((item) => `${item.quantity}x ${item.productName}`)
            .join("; "),
          transaction.totalAmount.toFixed(2),
          transaction.amountPaid.toFixed(2),
          transaction.change.toFixed(2),
          transaction.isVoiceTransaction ? "Voice" : "Manual",
          transaction.status,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Transaction history has been exported to CSV file",
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OfflineIndicator />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold">{stats.totalTransactions}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold">
                  ₱{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Transaction</p>
                <p className="text-3xl font-bold">
                  ₱{stats.averageTransaction.toFixed(2)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Voice Transactions</p>
                <p className="text-3xl font-bold">{stats.voiceTransactions}</p>
              </div>
              <Mic className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View and filter all sales transactions
              </CardDescription>
            </div>
            <Button onClick={exportTransactions} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={workerFilter} onValueChange={setWorkerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by worker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workers</SelectItem>
                {workers.map((worker) => (
                  <SelectItem key={worker.id} value={worker.email}>
                    {worker.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                currentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(transaction.timestamp, "MMM dd, yyyy")}
                        </div>
                        <div className="text-gray-500">
                          {format(transaction.timestamp, "HH:mm:ss")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {transaction.workerEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-48">
                        {transaction.items.map((item, index) => (
                          <div key={index} className="truncate">
                            {item.quantity}× {item.productName}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          ₱{transaction.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-gray-500">
                          Change: ₱{transaction.change.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>₱{transaction.amountPaid.toFixed(2)}</div>
                        <Badge variant="outline" className="text-xs">
                          {transaction.paymentMethod}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.isVoiceTransaction ? (
                        <Badge className="bg-purple-100 text-purple-800">
                          <Mic className="h-3 w-3 mr-1" />
                          Voice
                        </Badge>
                      ) : (
                        <Badge variant="outline">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredTransactions.length)} of{" "}
                {filteredTransactions.length} transactions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
