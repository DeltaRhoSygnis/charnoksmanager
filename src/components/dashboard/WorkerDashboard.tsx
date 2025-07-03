import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OfflineState } from "@/lib/offlineState";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Clock,
  List,
  User,
  BarChart,
  Plus,
  ArrowRight,
  Calendar,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from '@/lib/utils';
import { RecentSales } from "@/components/sales/RecentSales";

interface Sale {
  id: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  timestamp: Date;
}

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    weeklyAverage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [shiftStatus, setShiftStatus] = useState<'active' | 'break' | 'ended'>('active');

  useEffect(() => {
    if (user && user.email) {
      setLoading(true);
      Promise.all([fetchRecentSales(), fetchStats()])
        .finally(() => setLoading(false));
    }
  }, [user]);

  const fetchRecentSales = async () => {
    if (!user || !user.email) return;

    try {
      // Simplified fetch logic - implement your actual data fetching
      const salesQuery = query(
        collection(db, "sales"),
        where("workerEmail", "==", user.email),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          total: data.total,
          items: data.items,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });
      setRecentSales(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      // Fallback to local data
      setRecentSales([]);
    }
  };

  const fetchStats = async () => {
    // Simplified stats calculation - implement your actual logic
    setStats({
      todaySales: 2450,
      todayTransactions: 8,
      weeklyAverage: 12
    });
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const startShift = () => {
    setShiftStatus('active');
    // Implement actual shift start logic
  };

  const takeBreak = () => {
    setShiftStatus('break');
    // Implement break logic
  };

  const endShift = () => {
    setShiftStatus('ended');
    // Implement shift end logic
  };

  const renderMetricCard = (title: string, value: string | number, icon: JSX.Element, color: string) => (
    <Card className="bg-background border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4 flex items-center">
        <div className={`p-3 rounded-lg ${color} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-xl font-bold">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );

  const renderActionCard = (title: string, description: string, icon: JSX.Element, color: string) => (
    <Card className="bg-background border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className={`p-3 rounded-lg ${color} w-12 h-12 flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </CardContent>
    </Card>
  );

  const renderShiftStatus = () => {
    const statusConfig = {
      active: { 
        text: "On Shift", 
        color: "bg-green-100 text-green-800",
        button: "Take Break",
        action: takeBreak
      },
      break: { 
        text: "On Break", 
        color: "bg-amber-100 text-amber-800",
        button: "Resume Shift",
        action: startShift
      },
      ended: { 
        text: "Shift Ended", 
        color: "bg-gray-100 text-gray-800",
        button: "Start New Shift",
        action: startShift
      }
    };
    
    const config = statusConfig[shiftStatus];
    
    return (
      <Card className="bg-white border rounded-xl shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-4 ${config.color}`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Shift Status</h3>
                <Badge variant="outline" className={config.color.replace('bg-', '')}>
                  {config.text}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <Button 
                size="sm"
                onClick={config.action}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {config.button}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={endShift}
                disabled={shiftStatus === 'ended'}
              >
                End Shift
              </Button>
            </div>
          </div>
          
          {shiftStatus !== 'ended' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Start Time</p>
                  <p className="font-medium">8:00 AM</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Current Duration</p>
                  <p className="font-medium">4h 22m</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Break Time</p>
                  <p className="font-medium">30m</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSkeletonLoader = () => (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Skeleton className="w-12 h-12 rounded-lg mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-lg mr-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
                alt="Charnoks" 
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Charnoks POS
                </h1>
                <p className="text-gray-600">Worker Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  {user?.email || "worker@example.com"}
                </div>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? renderSkeletonLoader() : (
          <>
            {renderShiftStatus()}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {renderActionCard(
                "Record Sale",
                "Process a new transaction",
                <ShoppingCart size={24} className="text-white" />,
                "bg-green-500"
              )}
              
              {renderActionCard(
                "View Products",
                "Browse inventory items",
                <Package size={24} className="text-white" />,
                "bg-blue-500"
              )}
              
              {renderActionCard(
                "My Performance",
                "View your sales metrics",
                <BarChart size={24} className="text-white" />,
                "bg-purple-500"
              )}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {renderMetricCard(
                "Today's Sales",
                formatCurrency(stats.todaySales),
                <DollarSign size={20} className="text-green-600" />,
                "bg-green-100"
              )}
              
              {renderMetricCard(
                "Transactions",
                stats.todayTransactions,
                <List size={20} className="text-blue-600" />,
                "bg-blue-100"
              )}
              
              {renderMetricCard(
                "Weekly Avg. Sales",
                formatCurrency(stats.weeklyAverage),
                <TrendingUp size={20} className="text-purple-600" />,
                "bg-purple-100"
              )}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white border rounded-xl shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Transactions
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {recentSales.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No transactions recorded yet</p>
                      </div>
                    ) : (
                      recentSales.map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-4">
                              <ShoppingCart className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Sale #{sale.id.slice(0, 6)}</p>
                              <p className="text-sm text-gray-500">
                                {sale.items.length} items • {formatTime(sale.timestamp)}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-green-600">
                            {formatCurrency(sale.total)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule & Targets */}
              <div className="space-y-6">
                <Card className="bg-white border rounded-xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-amber-600" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div>
                        <p className="font-medium">Current Shift</p>
                        <p className="text-sm text-gray-500">8:00 AM - 5:00 PM</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Break Time</p>
                        <p className="text-sm text-gray-500">1:00 PM - 1:30 PM</p>
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border rounded-xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Daily Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Sales Target</span>
                          <span className="font-medium">{formatCurrency(3000)}</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block text-green-600">
                                {Math.min(100, Math.round((stats.todaySales / 3000) * 100))}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                            <div 
                              style={{ width: `${Math.min(100, (stats.todaySales / 3000) * 100)}%` }} 
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Transactions Target</span>
                          <span className="font-medium">15</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block text-blue-600">
                                {Math.min(100, Math.round((stats.todayTransactions / 15) * 100))}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                            <div 
                              style={{ width: `${Math.min(100, (stats.todayTransactions / 15) * 100)}%` }} 
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};