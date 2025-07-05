import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";

import {
  ShoppingCart,
  Receipt,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  Star,
  ArrowRight,
  Activity,
  Target,
} from "lucide-react";

const charnofsLogo = "/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png";

export const WorkerDashboard = () => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  // Mock data - replace with real data
  const todayStats = {
    sales: 12,
    revenue: 2850,
    avgOrder: 237.50,
    target: 3000,
  };

  const quickActions = [
    {
      title: "Record Sale",
      description: "Add new transaction",
      icon: ShoppingCart,
      path: "/sales",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-400",
    },
    {
      title: "Record Expense",
      description: "Log business expense",
      icon: Receipt,
      path: "/expenses",
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-400",
    },
    {
      title: "View History",
      description: "Check past transactions",
      icon: Activity,
      path: "/transactions",
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      title: "Today's Target",
      description: `₱${todayStats.target - todayStats.revenue} remaining`,
      icon: Target,
      path: "/analytics",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <OptimizedLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-bounce-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src={charnofsLogo} 
                alt="Charnoks Logo" 
                className="w-40 h-40 object-contain animate-pulse-glow"
              />
            </div>
            <h1 className="text-5xl font-bold charnoks-text animate-slide-in-left">
              Worker Dashboard
            </h1>
            <p className="text-xl text-white font-medium animate-slide-in-right">
              Welcome to your sales terminal
            </p>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              Welcome back, {user?.email?.split('@')[0]}!
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in-left delay-300">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.path}>
                <Card className="bg-black/20 border-white/20 backdrop-blur-sm hover:bg-black/30 transition-all duration-300 hover:scale-105 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${action.bgColor} border border-white/20`}>
                        <action.icon className={`w-8 h-8 ${action.iconColor}`} />
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-white mb-2">{action.title}</CardTitle>
                    <CardDescription className="text-white/80">
                      {action.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-in-right delay-500">
            <Card className="bg-black/20 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">₱{todayStats.revenue}</div>
                <div className="text-white/80 text-sm">Revenue</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{todayStats.sales}</div>
                <div className="text-white/80 text-sm">Sales</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">₱{todayStats.avgOrder}</div>
                <div className="text-white/80 text-sm">Avg Order</div>
              </CardContent>
            </Card>
            <Card className="bg-black/20 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">₱{todayStats.target - todayStats.revenue}</div>
                <div className="text-white/80 text-sm">To Target</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OptimizedLayout>
  );
};