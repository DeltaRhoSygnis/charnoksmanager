import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Badge } from "@/components/ui/badge";
import { FirebaseTestButton } from "@/components/ui/firebase-test-button";
import { CreateWorkerAccount } from "@/components/worker/CreateWorkerAccount";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { Settings as SettingsIcon, User, LogOut, Crown, Shield, Star, Plus, TestTube, Palette } from "lucide-react";

export const Settings = () => {
  const { user, logout } = useAuth();
  const [showCreateWorker, setShowCreateWorker] = useState(false);

  return (
    <OptimizedLayout>
      <div className="min-h-screen p-2 md:p-6 w-full">
        <div className="w-full max-w-full space-y-4 md:space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-bounce-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                <SettingsIcon className="w-full h-full text-purple-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold charnoks-text animate-slide-in-left">
              Account Settings
            </h1>
            <p className="text-lg md:text-xl text-white font-medium animate-slide-in-right">
              Manage your profile and system preferences
            </p>
            <div className="flex justify-center animate-bounce-in delay-300">
              <Badge
                className={`text-lg px-6 py-2 rounded-full font-bold ${
                  user?.role === "owner" 
                    ? "charnoks-gradient text-white" 
                    : "bg-blue-600 text-white"
                }`}
              >
                {user?.role === "owner" ? (
                  <Crown className="h-5 w-5 mr-2" />
                ) : (
                  <Shield className="h-5 w-5 mr-2" />
                )}
                {user?.role?.toUpperCase()} ACCOUNT
              </Badge>
            </div>
          </div>

          {/* Wide Rectangle Layout - No Grid */}
          <div className="space-y-4 w-full">
            {/* Profile Section - Wide Rectangle */}
            <AnimatedCard className="card-visible shadow-2xl animate-slide-in-left rounded-xl overflow-hidden w-full">
              <CardHeader className="bg-black/20 border-b border-white/20 p-4">
                <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-400" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Your account details and role information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <label className="text-sm font-semibold text-gray-300">Email Address</label>
                    <p className="text-white text-base font-medium">{user?.email}</p>
                  </div>
                  
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <label className="text-sm font-semibold text-gray-300">Account Role</label>
                    <p className="text-white text-base font-medium capitalize flex items-center gap-2">
                      {user?.role === "owner" ? (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <Shield className="h-4 w-4 text-blue-400" />
                      )}
                      {user?.role}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <label className="text-sm font-semibold text-gray-300">User ID</label>
                    <p className="text-white font-mono text-xs break-all">{user?.uid}</p>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>

            {/* App Preferences - Wide Rectangle */}
            <AnimatedCard className="card-visible shadow-2xl animate-slide-in-right rounded-xl overflow-hidden w-full">
              <CardHeader className="bg-black/20 border-b border-white/20 p-4">
                <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                  <SettingsIcon className="h-5 w-5 text-green-400" />
                  App Preferences
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Application preferences and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <p className="text-white font-bold text-base">Demo Mode</p>
                    <p className="text-gray-400 text-sm">Running with sample data</p>
                    <Badge className="bg-green-600 text-white font-bold px-3 py-1 mt-2 text-xs">Active</Badge>
                  </div>
                  
                  <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                    <p className="text-white font-bold text-base flex items-center gap-2">
                      <Palette className="h-4 w-4 text-purple-400" />
                      Theme Settings
                    </p>
                    <p className="text-gray-400 text-sm">Customize your visual experience</p>
                    <Badge className="bg-purple-600 text-white font-bold px-3 py-1 mt-2 text-xs">Active</Badge>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mt-4 w-full">
                  <ThemeSelector showTitle={false} compact={false} />
                </div>
              </CardContent>
            </AnimatedCard>

            {/* System Management - Owner Only - Wide Rectangle */}
            {user?.role === "owner" && (
              <AnimatedCard className="card-visible shadow-2xl animate-slide-in-right rounded-xl overflow-hidden w-full">
                <CardHeader className="bg-black/20 border-b border-white/20 p-4">
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                    <TestTube className="h-5 w-5 text-green-400" />
                    System Management
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Database testing and worker account management
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                      <h4 className="text-white font-bold text-base mb-2">Database Connection</h4>
                      <p className="text-gray-400 mb-3 text-sm">Test Firebase connectivity and database access</p>
                      <FirebaseTestButton />
                    </div>
                    
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                      <h4 className="text-white font-bold text-base mb-2">Worker Management</h4>
                      <p className="text-gray-400 mb-3 text-sm">Create new worker accounts for your business</p>
                      <AnimatedButton
                        onClick={() => setShowCreateWorker(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                        ripple={true}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Worker Account
                      </AnimatedButton>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            )}

            {/* Account Actions - Wide Rectangle */}
            <AnimatedCard className="card-visible shadow-2xl animate-slide-in-right rounded-xl overflow-hidden w-full">
              <CardHeader className="bg-black/20 border-b border-white/20 p-4">
                <CardTitle className="text-white text-xl font-bold">Account Actions</CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Manage your account and session
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <AnimatedButton
                  onClick={logout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-base"
                  ripple={true}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out of Account
                </AnimatedButton>
              </CardContent>
            </AnimatedCard>
          </div>



          {/* Additional Info Section - Wide Rectangle */}
          <AnimatedCard className="card-visible shadow-2xl animate-bounce-in rounded-xl overflow-hidden w-full">
            <CardHeader className="bg-black/20 border-b border-white/20 p-4 text-center">
              <CardTitle className="text-white text-xl font-bold">
                🌟 Charnoks Special Fried Chicken POS 🌟
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                Powering your restaurant with modern technology and cosmic style
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 text-center">
              <p className="text-white text-base font-medium">
                Thank you for using our advanced point-of-sale system!
              </p>
              <p className="text-gray-300 mt-2 text-sm">
                Experience the future of restaurant management with real-time analytics, 
                voice-powered transactions, and a stunning galactic interface.
              </p>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>
      
      {/* Create Worker Modal */}
      {showCreateWorker && (
        <CreateWorkerAccount onClose={() => setShowCreateWorker(false)} />
      )}
    </OptimizedLayout>
  );
};