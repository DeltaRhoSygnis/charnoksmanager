import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UniversalLayout } from "@/components/layout/UniversalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FirebaseTestButton } from "@/components/ui/firebase-test-button";
import { CreateWorkerAccount } from "@/components/worker/CreateWorkerAccount";
import { Settings as SettingsIcon, User, LogOut, Crown, Shield, Star, Plus, TestTube } from "lucide-react";

export const Settings = () => {
  const { user, logout } = useAuth();
  const [showCreateWorker, setShowCreateWorker] = useState(false);

  return (
    <UniversalLayout>
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 animate-bounce-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-black/20 rounded-2xl p-3 border border-white/20 backdrop-blur-sm">
                <SettingsIcon className="w-full h-full text-purple-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold charnoks-text animate-slide-in-left">
              Account Settings
            </h1>
            <p className="text-xl text-white font-medium animate-slide-in-right">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Section */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl animate-slide-in-left rounded-2xl overflow-hidden">
              <CardHeader className="bg-black/20 border-b border-white/20">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <User className="h-6 w-6 text-blue-400" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Your account details and role information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-300">Email Address</label>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <p className="text-white text-lg font-medium">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-300">Account Role</label>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <p className="text-white text-lg font-medium capitalize flex items-center gap-2">
                      {user?.role === "owner" ? (
                        <Crown className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <Shield className="h-5 w-5 text-blue-400" />
                      )}
                      {user?.role}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-300">User ID</label>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <p className="text-white font-mono text-sm break-all">{user?.uid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Section */}
            <div className="space-y-8">
              <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl animate-slide-in-right rounded-2xl overflow-hidden">
                <CardHeader className="bg-black/20 border-b border-white/20">
                  <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                    <Star className="h-6 w-6 text-yellow-400" />
                    System Status
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    Application preferences and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                    <div>
                      <p className="text-white font-bold text-lg">Demo Mode</p>
                      <p className="text-gray-400">Running with sample data</p>
                    </div>
                    <Badge className="bg-green-600 text-white font-bold px-4 py-2">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                    <div>
                      <p className="text-white font-bold text-lg">Galaxy Theme</p>
                      <p className="text-gray-400">Dynamic cosmic background</p>
                    </div>
                    <Badge className="bg-purple-600 text-white font-bold px-4 py-2">
                      Enabled
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* System Management - Owner Only */}
              {user?.role === "owner" && (
                <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl animate-slide-in-right delay-200 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-black/20 border-b border-white/20">
                    <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                      <TestTube className="h-6 w-6 text-green-400" />
                      System Management
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-lg">
                      Database testing and worker account management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-bold text-lg mb-2">Database Connection</h4>
                        <p className="text-gray-400 mb-4">Test Firebase connectivity and database access</p>
                        <FirebaseTestButton />
                      </div>
                      
                      <div>
                        <h4 className="text-white font-bold text-lg mb-2">Worker Management</h4>
                        <p className="text-gray-400 mb-4">Create new worker accounts for your business</p>
                        <Button
                          onClick={() => setShowCreateWorker(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add Worker Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Account Actions */}
              <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl animate-slide-in-right delay-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-black/20 border-b border-white/20">
                  <CardTitle className="text-white text-2xl font-bold">Account Actions</CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    Manage your account and session
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Button
                    onClick={logout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
                  >
                    <LogOut className="h-6 w-6 mr-3" />
                    Sign Out of Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Info Section */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/20 shadow-2xl animate-bounce-in delay-500 rounded-2xl overflow-hidden">
            <CardHeader className="bg-black/20 border-b border-white/20">
              <CardTitle className="text-white text-2xl font-bold text-center">
                🌟 Charnoks Special Fried Chicken POS 🌟
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg text-center">
                Powering your restaurant with modern technology and cosmic style
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <p className="text-white text-lg font-medium">
                Thank you for using our advanced point-of-sale system!
              </p>
              <p className="text-gray-300 mt-2">
                Experience the future of restaurant management with real-time analytics, 
                voice-powered transactions, and a stunning galactic interface.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Create Worker Modal */}
      {showCreateWorker && (
        <CreateWorkerAccount onClose={() => setShowCreateWorker(false)} />
      )}
    </UniversalLayout>
  );
};