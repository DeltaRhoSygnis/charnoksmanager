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
import { Toaster } from "@/components/ui/toaster";
import "./App.css";

function App() {
  useEffect(() => {
    // Test Firebase connectivity on app startup
    FirebaseTest.initialize().then((hasAccess) => {
      if (hasAccess) {
        console.log("🎉 Firebase connected successfully!");
      } else {
        console.log("💾 Running in demo mode");
      }
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
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
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
