
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, BarChart3, Package, Users, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizedLayout } from '@/components/layout/OptimizedLayout';

const charnofsLogo = "/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png";

export const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: ShoppingCart,
      title: "Quick Sales",
      description: "Streamlined sales recording without shopping cart for faster transactions",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Package,
      title: "Smart Inventory",
      description: "Real-time product tracking with automatic stock updates",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive reports and performance insights with beautiful charts",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Multi-User System",
      description: "Owner and worker roles with different access levels and permissions",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  return (
    <OptimizedLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center space-y-8">
              {/* Logo */}
              <div className="flex items-center justify-center gap-3 mb-6 animate-bounce-in">
                <img 
                  src={charnofsLogo} 
                  alt="Charnoks Logo" 
                  className="w-48 h-48 object-contain animate-pulse-glow"
                />
              </div>
              
              <div className="space-y-4 animate-slide-in-left">
                <h1 className="text-4xl md:text-6xl font-bold charnoks-text mb-6">
                  Charnoks POS System
                </h1>
                <p className="text-xl md:text-2xl text-white font-medium mb-8 max-w-3xl mx-auto">
                  Complete Point of Sale solution for your Special Fried Chicken restaurant
                </p>
              </div>
              
              {user ? (
                <div className="space-y-4 animate-slide-in-right">
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <p className="text-lg text-white font-medium">Welcome back, {user.email?.split('@')[0]}!</p>
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <Link to="/dashboard">
                    <Button size="lg" className="text-lg px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-none">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-x-4 animate-slide-in-right">
                  <Link to="/login">
                    <Button size="lg" className="text-lg px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-none">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-white/30 text-white hover:bg-white/10">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12 animate-bounce-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">
                Everything you need to run your restaurant
              </h2>
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-xl text-white/80">
              Powerful features designed for modern restaurant management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-black/20 border-white/20 backdrop-blur-sm hover:bg-black/30 transition-all duration-300 hover:scale-105 animate-slide-in-left" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 border border-white/20`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-white/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-t border-white/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white animate-bounce-in">
              Ready to modernize your restaurant?
            </h2>
            <p className="text-xl mb-8 text-white/80 animate-slide-in-left">
              Join the digital revolution in restaurant management
            </p>
            {!user && (
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-none animate-slide-in-right">
                  Start Free Trial
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </OptimizedLayout>
  );
};
