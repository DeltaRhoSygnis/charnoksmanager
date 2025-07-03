import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
} from "date-fns";
import { Sale } from "@/types/sales";

interface SummaryData {
  period: string;
  sales: number;
  transactions: number;
  averageOrder: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
}

export const Summary = () => {
  const { user } = useAuth();
  const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [period, setPeriod] = useState("weekly");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.uid) {
      fetchSummaryData();
    }
  }, [period, user]);

  const fetchSummaryData = async () => {
    if (!user || !user.uid) {
      console.log("User not authenticated, skipping summary data fetch");
      return;
    }

    setIsLoading(true);
    try {
      const summaries: SummaryData[] = [];
      const periods = period === "weekly" ? 4 : 6; // 4 weeks or 6 months

      for (let i = 0; i < periods; i++) {
        const { start, end, label } = getPeriodRange(i, period);

        const salesQuery = query(
          collection(db, "sales"),
          where("timestamp", ">=", start),
          where("timestamp", "<=", end),
          orderBy("timestamp", "desc"),
        );

        const snapshot = await getDocs(salesQuery);
        const sales: Sale[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            items: data.items || [],
            total: data.total || 0,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalTransactions = sales.length;
        const averageOrder =
          totalTransactions > 0 ? totalSales / totalTransactions : 0;

        // Calculate top products
        const productSales: {
          [key: string]: { quantity: number; revenue: number };
        } = {};

        sales.forEach((sale) => {
          if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach((item) => {
              if (!productSales[item.name]) {
                productSales[item.name] = { quantity: 0, revenue: 0 };
              }
              productSales[item.name].quantity += item.quantity || 0;
              productSales[item.name].revenue += item.total || 0;
            });
          }
        });

        const topProducts = Object.entries(productSales)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 3);

        summaries.push({
          period: label,
          sales: totalSales,
          transactions: totalTransactions,
          averageOrder,
          topProducts,
        });
      }

      setSummaryData(summaries);
    } catch (error: any) {
      console.error("Error fetching summary data:", error);
      if (error.code === "permission-denied") {
        console.warn(
          "Firestore access denied. This might be due to database security rules.",
        );
      }
    }
    setIsLoading(false);
  };

  const getPeriodRange = (index: number, periodType: string) => {
    const now = new Date();

    if (periodType === "weekly") {
      const weekStart = startOfWeek(subWeeks(now, index));
      const weekEnd = endOfWeek(subWeeks(now, index));
      return {
        start: weekStart,
        end: weekEnd,
        label: `Week of ${format(weekStart, "MMM dd")}`,
      };
    } else {
      const monthStart = startOfMonth(subMonths(now, index));
      const monthEnd = endOfMonth(subMonths(now, index));
      return {
        start: monthStart,
        end: monthEnd,
        label: format(monthStart, "MMMM yyyy"),
      };
    }
  };

  const exportToCSV = () => {
    const csvData = summaryData.map((data) => ({
      Period: data.period,
      Sales: data.sales,
      Transactions: data.transactions,
      "Average Order": data.averageOrder,
      "Top Product": data.topProducts[0]?.name || "N/A",
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-summary-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sales Summary</h1>
          <div className="flex items-center space-x-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} disabled={isLoading}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {summaryData.map((data, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        {data.period}
                      </CardTitle>
                      <CardDescription>
                        {data.transactions} transactions • ₱
                        {data.averageOrder.toFixed(2)} avg order
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₱{data.sales.toFixed(2)}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        {index < summaryData.length - 1 && (
                          <>
                            {data.sales > summaryData[index + 1].sales ? (
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            {data.sales > summaryData[index + 1].sales
                              ? "Increased"
                              : "Decreased"}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Performance Metrics
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Sales:</span>
                          <span className="font-medium">
                            ₱{data.sales.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transactions:</span>
                          <span className="font-medium">
                            {data.transactions}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Order:</span>
                          <span className="font-medium">
                            ₱{data.averageOrder.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Top Products</h4>
                      <div className="space-y-2">
                        {data.topProducts.length > 0 ? (
                          data.topProducts.map((product, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600">
                                {product.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">
                                  {product.quantity}
                                </Badge>
                                <span className="text-sm">
                                  ₱{product.revenue.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No sales data</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
