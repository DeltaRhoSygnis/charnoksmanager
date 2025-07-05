
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

          // Initialize user with default owner role first
          let userRole: 'owner' | 'worker' = 'owner';

          try {
            // Try to get user data from Firestore with extended timeout
            const userDocPromise = getDoc(doc(db, "users", firebaseUser.uid));
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Firestore timeout")), 8000)
            );

            const userDoc = await Promise.race([userDocPromise, timeoutPromise]) as any;
            const userData = userDoc.data();

            console.log("User data from Firestore:", userData);

            if (userData?.role) {
              userRole = userData.role;
              console.log("User role from Firestore:", userRole);
            } else {
              console.log("No role found in Firestore, checking localStorage backup");
              
              // Check if we have a backup role in localStorage
              const backupRole = localStorage.getItem(`user_role_${firebaseUser.uid}`);
              if (backupRole === 'worker' || backupRole === 'owner') {
                userRole = backupRole as 'owner' | 'worker';
                console.log("Using backup role from localStorage:", userRole);
              }
            }
          } catch (firestoreError: any) {
            console.error("Firestore error:", firestoreError);
            
            // Try to get role from localStorage as backup
            const backupRole = localStorage.getItem(`user_role_${firebaseUser.uid}`);
            if (backupRole === 'worker' || backupRole === 'owner') {
              userRole = backupRole as 'owner' | 'worker';
              console.log("Using backup role from localStorage due to Firestore error:", userRole);
            } else {
              console.warn("No backup role found, defaulting to owner");
            }

            // Show helpful error message for network issues
            if (firestoreError.code === "permission-denied") {
              console.warn("Firestore access denied. Using offline mode.");
            } else if (
              firestoreError.message?.includes("network") ||
              firestoreError.message?.includes("fetch") ||
              firestoreError.message?.includes("timeout")
            ) {
              console.warn("Network connectivity issue. Using offline mode.");
            }
          }

          // Store role in localStorage as backup
          localStorage.setItem(`user_role_${firebaseUser.uid}`, userRole);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            role: userRole,
          });
          setError(null);
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
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Don't set loading to false here - let onAuthStateChanged handle it
    } catch (error: any) {
      console.error("Login error:", error);
      setLoading(false);
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
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Firestore timeout")), 5000),
          ),
        ]);
        
        // Store role in localStorage as backup
        localStorage.setItem(`user_role_${result.user.uid}`, 'owner');
      } catch (firestoreError: any) {
        console.error("Failed to save user data to Firestore:", firestoreError);
        // Store role in localStorage as backup even if Firestore fails
        localStorage.setItem(`user_role_${result.user.uid}`, 'owner');
        
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
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
      }

      // Store worker role in localStorage as backup
      localStorage.setItem(`user_role_${result.user.uid}`, 'worker');

      // Clean up temporary app by signing out
      await signOut(tempAuth);
    } catch (error: any) {
      console.error("Worker creation error:", error);
      setError(error.message || "Failed to create worker account");
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      // Clear localStorage backup when logging out
      if (user?.uid) {
        localStorage.removeItem(`user_role_${user.uid}`);
      }
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
