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
import { Settings as SettingsIcon, User, LogOut, Crown, Shield, Star, Plus, TestTube, Palette, Smartphone, Database } from "lucide-react";

export const Settings = () => {
  const { user, logout } = useAuth();
  const [showCreateWorker, setShowCreateWorker] = useState(false);

  return (
    <div className="modern-app-container">
      {/* Modern App Header */}
      <div className="modern-app-header">
        <div className="modern-app-title">
          ⚙️ Settings
        </div>
        <div className="modern-app-subtitle">
          Manage your account and preferences
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        <div className="space-y-4">
          {/* User Profile Card */}
          <div className="modern-card">
            <div className="modern-card-header">
              <div className="modern-card-icon">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="modern-card-title">Profile Information</div>
                <div className="modern-card-subtitle">Your account details</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Email</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <div className="modern-badge">
                  {user?.role === "owner" ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Owner
                    </>
                  ) : (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Worker
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* App Preferences */}
          <div className="modern-card">
            <div className="modern-card-header">
              <div className="modern-card-icon">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="modern-card-title">App Preferences</div>
                <div className="modern-card-subtitle">Customize your experience</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Demo Mode</div>
                  <div className="text-xs text-gray-500">Running with sample data</div>
                </div>
                <div className="modern-badge">Active</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Theme</div>
                  <div className="text-xs text-gray-500">Purple & Orange</div>
                </div>
                <div className="modern-badge-orange">Modern</div>
              </div>
            </div>
          </div>

          {/* System Management - Owner Only */}
          {user?.role === "owner" && (
            <div className="modern-card">
              <div className="modern-card-header">
                <div className="modern-card-icon">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="modern-card-title">System Management</div>
                  <div className="modern-card-subtitle">Database and worker management</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm mb-2">Database Connection</div>
                  <FirebaseTestButton />
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm mb-2">Worker Management</div>
                  <button 
                    onClick={() => setShowCreateWorker(true)}
                    className="modern-btn text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Worker Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Actions */}
          <div className="modern-card">
            <div className="modern-card-header">
              <div className="modern-card-icon">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <div className="modern-card-title">Account Actions</div>
                <div className="modern-card-subtitle">Manage your session</div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2 inline" />
              Sign Out
            </button>
          </div>

          {/* App Info */}
          <div className="modern-card text-center">
            <div className="modern-card-title">🌟 Charnoks Special Fried Chicken POS</div>
            <div className="modern-card-subtitle mt-2">
              Powering your restaurant with modern technology
            </div>
          </div>
        </div>
      </div>

      {/* Create Worker Modal */}
      {showCreateWorker && (
        <CreateWorkerAccount onClose={() => setShowCreateWorker(false)} />
      )}
    </div>
  );
};