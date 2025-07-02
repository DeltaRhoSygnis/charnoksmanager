
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, BarChart3, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: ShoppingCart,
      title: "Record Sales",
      description: "Easy-to-use shopping cart interface for recording sales transactions"
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track products, stock levels, and automatically update inventory"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "View sales trends, generate reports, and track business performance"
    },
    {
      icon: Users,
      title: "Multi-Branch Support",
      description: "Manage multiple store locations with role-based access control"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sari POS
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Complete Point of Sale solution for small businesses and sari-sari stores
            </p>
            
            {user ? (
              <div className="space-y-4">
                <p className="text-lg text-gray-700">Welcome back, {user.email}!</p>
                <Link to="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to run your store
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed for small businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to modernize your store?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of store owners who trust Sari POS for their business
          </p>
          {!user && (
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
