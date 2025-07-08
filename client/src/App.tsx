
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
import { Home } from "@/pages/Home";
import { ProductsModern } from "@/pages/ProductsModern";
import { SalesModern } from "@/pages/SalesModern";
import { ExpensesModern } from "@/pages/ExpensesModern";
import { AnalysisModern } from "@/pages/AnalysisModern";
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
      
      // Test database connections in priority order
      import("@/lib/databasePriority").then(({ DatabasePriority }) => {
        DatabasePriority.initialize().catch((error) => {
          console.error("Database initialization error:", error);
          // Silently continue with local storage backup
        });
      }).catch((error) => {
        console.error("Error importing DatabasePriority:", error);
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
              path="/"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <Home />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <SalesModern />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <ExpensesModern />
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
                  <ProductsModern />
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
              path="/analysis"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <AnalysisModern />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <AnalysisModern />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/data-analysis"
              element={
                <RoleBasedRoute allowedRoles={['owner']} redirectTo="/">
                  <AnalysisModern />
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
              path="/dashboard"
              element={
                <RoleBasedRoute allowedRoles={['owner', 'worker']}>
                  <Home />
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
