import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Stars, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-blue-300 opacity-20 animate-pulse">
          <Stars size={24} />
        </div>
        <div className="absolute top-32 right-20 text-purple-300 opacity-30 animate-bounce">
          <Sparkles size={16} />
        </div>
        <div className="absolute bottom-20 left-1/4 text-blue-400 opacity-25 animate-pulse">
          <Stars size={20} />
        </div>
        <div className="absolute bottom-40 right-1/3 text-indigo-300 opacity-20">
          <Sparkles size={12} />
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-xl text-white">
        <CardHeader className="text-center pb-8 space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/lovable-uploads/389a9fc0-9ada-493a-a167-71ea82a7aabb.png" 
              alt="Charnoks" 
              className="h-12 w-12 object-contain"
            />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Charnoks POS
            </CardTitle>
          </div>
          <CardDescription className="text-blue-200">Welcome to the future of retail</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-blue-100">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-2 bg-white/10 border-blue-300/30 focus:border-blue-400 focus:ring-blue-400/50 text-white placeholder-blue-200/50 backdrop-blur-sm"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-sm text-red-300 mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password" className="text-blue-100">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-2 bg-white/10 border-blue-300/30 focus:border-blue-400 focus:ring-blue-400/50 text-white placeholder-blue-200/50 backdrop-blur-sm"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-red-300 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg h-12 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-blue-200">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-300 hover:text-purple-300 font-medium hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
