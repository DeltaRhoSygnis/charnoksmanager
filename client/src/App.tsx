
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { FirebaseTest } from "@/lib/firebaseTest";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Products } from "@/components/products/Products";
import { Sales } from "@/pages/Sales";
import { Expenses } from "@/pages/Expenses";
import { Analytics } from "@/components/analytics/Analytics";
import { Summary } from "@/components/reports/Summary";
import { Settings } from "@/pages/Settings";
import { Transactions } from "@/pages/Transactions";
import { DataAnalysis } from "@/pages/DataAnalysis";
import { CosmicBackground } from "@/components/ui/cosmic-background";
import { Toaster } from "@/components/ui/toaster";
import { DemoStatus } from "@/components/ui/demo-status";
import { queryClient } from "@/lib/queryClient";
import "./App.css";
import "./styles/mobile-optimized.css";

function App() {
  useEffect(() => {
    // Initialize Firebase connection testing
    try {
      console.log("🚀 Starting Charnoks POS...");
      
      // Add global error handlers for uncaught promise rejections
      const handleUnhandledRejection = (event: any) => {
        console.error("Unhandled promise rejection:", event.reason);
        // Prevent the error from being logged to console as uncaught
        event.preventDefault();
      };
      
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      
      // Test Firebase access on app start
      import("@/lib/firebaseTest").then(({ FirebaseTest }) => {
        FirebaseTest.initialize().catch((error) => {
          console.error("Firebase initialization error:", error);
          // Silently continue with demo mode
        });
      }).catch((error) => {
        console.error("Error importing FirebaseTest:", error);
      });
      
      // Cleanup
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
      
    } catch (error) {
      console.error("Error during app initialization:", error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen w-full relative">
            <CosmicBackground />
            <DemoStatus />
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Shared Routes - Accessible by both owners and workers */}
            <Route
              path="/dashboard"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <Dashboard />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <Sales />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <Expenses />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <Settings />
                </RoleBasedRoute>
              }
            />

            {/* Owner-Only Routes - Restricted to owners only */}
            <Route
              path="/products"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <Products />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <Transactions />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <Analytics />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <DataAnalysis />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/data-analysis"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <DataAnalysis />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <Summary />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <Dashboard />
                </RoleBasedRoute>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
