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
import { Stars, Sparkles, Lock, Mail, ChefHat, UserPlus } from 'lucide-react';
import charnoksLogo from '@assets/389a9fc0-9ada-493a-a167-71ea82a7aabb_1751553002348.png';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.email, data.password);
      navigate('/dashboard');
      toast({
        title: "Welcome to Charnoks!",
        description: "Your account has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again with different credentials",
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
              <div className="w-36 h-36 bg-black/20 rounded-3xl p-3 shadow-2xl border border-white/20 backdrop-blur-sm">
                <img 
                  src={charnoksLogo} 
                  alt="Charnoks - Special Fried Chicken" 
                  className="w-full h-full object-contain animate-pulse-glow"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-lg"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold charnoks-text mb-2 animate-slide-in-left">
            Join Charnoks
          </h1>
          <h2 className="text-xl font-semibold text-white mb-2 animate-slide-in-right">
            Create Your Account
          </h2>
          <p className="text-gray-200 font-medium flex items-center justify-center gap-2">
            <ChefHat className="h-5 w-5" />
            Start managing your restaurant today
          </p>
        </div>

        {/* Registration Form */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl animate-bounce-in delay-300 rounded-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 charnoks-gradient"></div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl font-bold flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6 text-green-400" />
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-300">
              Join the Charnoks family and start growing your business
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                    className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 px-4"
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
                <Label htmlFor="password" className="text-white font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 px-4"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 px-4"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full charnoks-gradient hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg h-12"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="animate-spin h-5 w-5" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Stars className="h-5 w-5" />
                    Join Charnoks POS
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-red-400 hover:text-red-300 font-bold transition-colors duration-300 underline decoration-wavy hover:decoration-solid"
                >
                  Sign In Here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};