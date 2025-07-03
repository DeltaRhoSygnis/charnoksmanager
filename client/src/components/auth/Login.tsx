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
import { Stars, Sparkles, Lock, Mail, ChefHat } from 'lucide-react';
import charnoksLogo from '@assets/389a9fc0-9ada-493a-a167-71ea82a7aabb_1751553002348.png';

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
        title: "Welcome to Charnoks!",
        description: "Successfully signed in to your POS system",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your email and password",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full galaxy-animated cosmic-overlay flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Charnoks Logo Section */}
        <div className="text-center animate-bounce-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-48 h-48 rounded-3xl p-4 shadow-2xl">
                <img 
                  src={charnoksLogo} 
                  alt="Charnoks - Special Fried Chicken" 
                  className="w-full h-full object-contain animate-pulse-glow drop-shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-3xl blur-xl"></div>
            </div>
          </div>
          <h1 className="text-6xl font-bold charnoks-text mb-2 animate-slide-in-left">
            Charnoks
          </h1>
          <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2 animate-slide-in-right">
            Point of Sale System
          </h2>
          <p className="text-white font-bold drop-shadow-md flex items-center justify-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-300" />
            Special Fried Chicken & More
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl animate-bounce-in delay-300 rounded-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 charnoks-gradient"></div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-3xl font-bold flex items-center justify-center gap-2 drop-shadow-lg">
              <Stars className="h-6 w-6 text-yellow-400" />
              Welcome Back
            </CardTitle>
            <CardDescription className="text-white font-semibold text-lg drop-shadow-md">
              Sign in to manage your Charnoks restaurant
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-semibold text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@charnoks.com"
                    {...register('email')}
                    className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-14 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-lg px-4"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-semibold text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-14 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-lg px-4"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full charnoks-gradient hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg h-14"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="animate-spin h-6 w-6" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <ChefHat className="h-6 w-6" />
                    Enter Charnoks POS
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-300 text-lg">
                Need an account?{' '}
                <Link 
                  to="/register" 
                  className="text-red-400 hover:text-red-300 font-bold transition-colors duration-300 underline decoration-wavy hover:decoration-solid"
                >
                  Create New Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};