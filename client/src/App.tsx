
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import "./App.css";

function App() {
  useEffect(() => {
    // Initialize Firebase connection testing
    try {
      console.log("🚀 Starting Charnoks POS...");
      
      // Test Firebase access on app start
      import("@/lib/firebaseTest").then(({ FirebaseTest }) => {
        FirebaseTest.initialize();
      });
      
    } catch (error) {
      console.error("Error during app initialization:", error);
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full relative">
          <CosmicBackground />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-analysis"
              element={
                <ProtectedRoute>
                  <DataAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Summary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
