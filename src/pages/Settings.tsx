
import { useAuth } from "@/hooks/useAuth";
import { ResponsiveLayout } from "@/components/dashboard/ResponsiveLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, LogOut } from "lucide-react";

export const Settings = () => {
  const { user, logout } = useAuth();

  return (
    <ResponsiveLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <Badge
            variant={user?.role === "owner" ? "default" : "secondary"}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
          >
            {user?.role?.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your account details and role information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Email</label>
                <p className="text-white mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Role</label>
                <p className="text-white mt-1 capitalize">{user?.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">User ID</label>
                <p className="text-white mt-1 font-mono text-sm">{user?.uid}</p>
              </div>
            </CardContent>
          </Card>

          {/* System Section */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <SettingsIcon className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription className="text-gray-300">
                Application preferences and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Demo Mode</p>
                  <p className="text-gray-400 text-sm">Running in demo mode with sample data</p>
                </div>
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Account Actions</CardTitle>
              <CardDescription className="text-gray-300">
                Manage your account and session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={logout}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  );
};
