import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AuthUser } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  createWorkerAccount: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log("Firebase user authenticated:", firebaseUser.uid);

          try {
            // Try to get user data from Firestore with timeout
            const userDoc = await Promise.race([
              getDoc(doc(db, "users", firebaseUser.uid)),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Firestore timeout")), 5000),
              ),
            ]);
            const userData = userDoc.data();

            console.log("User data from Firestore:", userData);

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              role: userData?.role || "owner",
            });
            setError(null);
          } catch (firestoreError: any) {
            console.error("Firestore error:", firestoreError);
            // Set user with default role when Firestore is unavailable
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              role: "owner",
            });

            // Show helpful error message for network issues
            if (firestoreError.code === "permission-denied") {
              console.warn("Firestore access denied. Using offline mode.");
            } else if (
              firestoreError.message?.includes("network") ||
              firestoreError.message?.includes("fetch")
            ) {
              console.warn("Network connectivity issue. Using offline mode.");
            } else {
              console.warn("Database access limited, using default settings");
            }
            setError(null); // Don't show error to user, just log it
          }
        } else {
          console.log("No Firebase user");
          setUser(null);
          setError(null);
        }
      } catch (authError: any) {
        console.error("Auth state change error:", authError);
        setUser(null);
        if (authError.code === "auth/network-request-failed") {
          setError(
            "Network connection error. Please check your internet connection.",
          );
        } else {
          setError("Authentication error occurred");
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/network-request-failed") {
        setError(
          "Network connection error. Please check your internet connection.",
        );
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError(error.message || "Login failed");
      }
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      try {
        // Try to save user data with timeout
        await Promise.race([
          setDoc(doc(db, "users", result.user.uid), {
            email: result.user.email,
            role: "owner",
            createdAt: new Date(),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firestore timeout")), 5000),
          ),
        ]);
      } catch (firestoreError: any) {
        console.error("Failed to save user data to Firestore:", firestoreError);
        // Continue anyway - user is still registered
        if (firestoreError.code === "permission-denied") {
          console.warn(
            "Firestore write permission denied. User registered successfully but data not saved to database.",
          );
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "auth/network-request-failed") {
        setError(
          "Network connection error. Please check your internet connection.",
        );
      } else {
        setError(error.message || "Registration failed");
      }
      throw error;
    }
  };

  const createWorkerAccount = async (email: string, password: string) => {
    if (!user || user.role !== "owner") {
      throw new Error("Only owners can create worker accounts");
    }

    try {
      setError(null);

      // Store current user info
      const currentUser = auth.currentUser;

      // Create worker account without affecting current auth state
      const { initializeApp } = await import("firebase/app");
      const { getAuth, createUserWithEmailAndPassword: createUser } =
        await import("firebase/auth");

      // Create a temporary app instance for worker creation
      const tempApp = initializeApp(
        {
          apiKey: "AIzaSyAPPca8x5cdT_nTHClFlmsGIV3PE7Abdv4",
          authDomain: "mystoreapp-dcc31.firebaseapp.com",
          projectId: "mystoreapp-dcc31",
          storageBucket: "mystoreapp-dcc31.firebasestorage.app",
          messagingSenderId: "438314522218",
          appId: "1:438314522218:web:900ba71959d6fcd5cd1c13",
          measurementId: "G-H2XHWKZD3C",
        },
        "temp-worker-creation",
      );

      const tempAuth = getAuth(tempApp);
      const result = await createUser(tempAuth, email, password);

      try {
        await setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email,
          role: "worker",
          createdBy: user.uid,
          createdAt: new Date(),
        });
      } catch (firestoreError) {
        console.error(
          "Failed to save worker data to Firestore:",
          firestoreError,
        );
        // Continue anyway - worker account is still created
      }

      // Clean up temporary app
      await tempApp.delete();
    } catch (error: any) {
      console.error("Worker creation error:", error);
      setError(error.message || "Failed to create worker account");
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout error:", error);
      setError(error.message || "Logout failed");
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    createWorkerAccount,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
