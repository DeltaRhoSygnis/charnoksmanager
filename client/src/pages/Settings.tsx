
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { UniversalLayout } from "@/components/layout/UniversalLayout";
import { CreateWorkerAccount } from "@/components/worker/CreateWorkerAccount";
import { FirebaseTestButton } from "@/components/ui/firebase-test-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Users,
  LogOut,
  Bell,
  Palette,
  Lock,
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [showCreateWorker, setShowCreateWorker] = useState(false);

  const MobileLayout = () => (
    <div className="space-y-4">
      {/* Profile Section */}
      <Card className="bg-black/20 backdrop-blur-lg border border-orange-400/30">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Profile</CardTitle>
              <CardDescription className="text-white/70">
                {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/80">Role</span>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              {user?.role?.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/80">Status</span>
            <Badge variant="outline" className="border-green-400 text-green-400">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card className="bg-black/20 backdrop-blur-lg border border-orange-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-400" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Firebase Connection</span>
              <FirebaseTestButton />
            </div>
            
            {user?.role === "owner" && (
              <>
                <Separator className="bg-white/20" />
                <Button
                  onClick={() => setShowCreateWorker(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Worker Account
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card className="bg-black/20 backdrop-blur-lg border border-orange-400/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2 text-purple-400" />
            App Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
            <Bell className="h-4 w-4 mr-3" />
            Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
            <Palette className="h-4 w-4 mr-3" />
            Theme
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
            <Lock className="h-4 w-4 mr-3" />
            Privacy
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-black/20 backdrop-blur-lg border border-red-400/30">
        <CardContent className="p-4">
          <Button
            onClick={logout}
            variant="destructive"
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const DesktopLayout = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-white/70">Manage your account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Section */}
        <Card className="bg-black/20 backdrop-blur-lg border border-orange-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <User className="h-6 w-6 mr-3 text-orange-400" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Email</span>
                <span className="text-white font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Role</span>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Status</span>
                <Badge variant="outline" className="border-green-400 text-green-400">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-black/20 backdrop-blur-lg border border-orange-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <Database className="h-6 w-6 mr-3 text-blue-400" />
              System Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Firebase Connection</span>
                <FirebaseTestButton />
              </div>
              
              {user?.role === "owner" && (
                <>
                  <Separator className="bg-white/20" />
                  <Button
                    onClick={() => setShowCreateWorker(true)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add Worker Account
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="bg-black/20 backdrop-blur-lg border border-orange-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <SettingsIcon className="h-6 w-6 mr-3 text-purple-400" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
              <Bell className="h-5 w-5 mr-3" />
              Notification Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
              <Palette className="h-5 w-5 mr-3" />
              Theme Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10">
              <Lock className="h-5 w-5 mr-3" />
              Privacy Settings
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-black/20 backdrop-blur-lg border border-red-400/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-xl">
              <Shield className="h-6 w-6 mr-3 text-red-400" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={logout}
              variant="destructive"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout from Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <UniversalLayout>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
      
      {/* Create Worker Modal */}
      {showCreateWorker && (
        <CreateWorkerAccount onClose={() => setShowCreateWorker(false)} />
      )}
    </UniversalLayout>
  );
}
