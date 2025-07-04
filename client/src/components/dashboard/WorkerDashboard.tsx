import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/15 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {trend && (
              <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend > 0 ? '+' : ''}{trend}% from yesterday
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ title, description, icon: Icon, path, color, bgColor, iconColor }: any) => (
    <Link to={path} className="block group">
      <Card className="bg-white/5 backdrop-blur-lg border-white/20 text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${bgColor} border border-white/20 group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white group-hover:text-orange-300 transition-colors duration-300">{title}</h3>
              <p className="text-white/70 text-sm mt-1">{description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const MobileLayout = () => (
    <div className="min-h-screen space-y-6">
      {/* Mobile Header */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-3 shadow-lg">
              <img 
                src={charnofsLogo} 
                alt="Charnoks Special Fried Chicken" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Charnoks
              </h2>
              <p className="text-white/80 font-medium">Worker Station</p>
              <Badge className="mt-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                {user?.email?.split('@')[0]}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-white hover:bg-red-500/20 border border-white/30 px-4 py-2 rounded-xl"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white px-2">Today's Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Sales Count" 
            value={todayStats.sales} 
            icon={ShoppingCart} 
            trend={8}
            color="bg-green-500/20"
          />
          <StatCard 
            title="Revenue" 
            value={`₱${todayStats.revenue}`} 
            icon={DollarSign} 
            trend={12}
            color="bg-blue-500/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Avg Order" 
            value={`₱${todayStats.avgOrder}`} 
            icon={TrendingUp} 
            trend={-3}
            color="bg-purple-500/20"
          />
          <StatCard 
            title="Target Progress" 
            value={`${Math.round((todayStats.revenue / todayStats.target) * 100)}%`} 
            icon={Target} 
            color="bg-orange-500/20"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white px-2">Quick Actions</h3>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <ActionCard key={action.path} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-400" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Sale recorded</p>
                <p className="text-xs text-white/60">₱250.00 • 2 minutes ago</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const DesktopLayout = () => (
    <div className="min-h-screen space-y-8">
      {/* Desktop Header */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-4 shadow-xl animate-pulse-glow">
              <img 
                src={charnofsLogo} 
                alt="Charnoks Special Fried Chicken" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                Charnoks POS
              </h2>
              <p className="text-white/80 text-lg font-medium">Worker Station • Special Fried Chicken</p>
              <div className="flex items-center space-x-3 mt-2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1">
                  {user?.email?.split('@')[0]}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white/80">
                  Active Session
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white/60 text-sm">Current Time</p>
              <p className="text-white font-bold text-lg">{new Date().toLocaleTimeString()}</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/50 px-6 py-3 rounded-xl"
            >
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Sales" 
          value={todayStats.sales} 
          icon={ShoppingCart} 
          trend={8}
          color="bg-green-500/20"
        />
        <StatCard 
          title="Revenue" 
          value={`₱${todayStats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend={12}
          color="bg-blue-500/20"
        />
        <StatCard 
          title="Average Order" 
          value={`₱${todayStats.avgOrder}`} 
          icon={TrendingUp} 
          trend={-3}
          color="bg-purple-500/20"
        />
        <StatCard 
          title="Target Progress" 
          value={`${Math.round((todayStats.revenue / todayStats.target) * 100)}%`} 
          icon={Target}
          color="bg-orange-500/20"
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => (
            <ActionCard key={action.path} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2 text-xl">
            <Clock className="h-6 w-6 text-orange-400" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription className="text-white/60">
            Latest transactions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-300">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium text-white">Sale recorded - Chicken Combo</p>
                  <p className="text-sm text-white/60">₱250.00 • 2 minutes ago</p>
                </div>
                <Badge variant="outline" className="border-green-400/50 text-green-400">
                  Completed
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};