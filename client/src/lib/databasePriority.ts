import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { supabase } from "./supabase";
import { OfflineState } from "./offlineState";
import { LocalStorageDB } from "./localStorageDB";

export class DatabasePriority {
  private static readonly TIMEOUT_MS = 5000;

  static async initialize(): Promise<void> {
    console.log("🔄 Testing database connections in priority order...");
    
    // Priority 1: Supabase
    if (await this.testSupabase()) {
      console.log("✅ Using Supabase as primary database");
      this.setActiveDatabase('supabase');
      return;
    }

    // Priority 2: Firebase
    if (await this.testFirebase()) {
      console.log("✅ Using Firebase as primary database");
      this.setActiveDatabase('firebase');
      return;
    }

    // Priority 3: Neon (PostgreSQL)
    if (await this.testNeon()) {
      console.log("✅ Using Neon PostgreSQL as primary database");
      this.setActiveDatabase('neon');
      return;
    }

    // Fallback: Local storage (clean demo mode)
    console.log("⚠️ No database connections available, using local storage backup");
    this.setActiveDatabase('local');
    this.setupCleanDemoMode();
  }

  private static async testSupabase(): Promise<boolean> {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), this.TIMEOUT_MS)
      );

      const testQuery = supabase.from('users').select('count').limit(1);
      await Promise.race([testQuery, timeoutPromise]);

      return true;
    } catch (error) {
      console.log("❌ Supabase connection failed:", error);
      return false;
    }
  }

  private static async testFirebase(): Promise<boolean> {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firebase timeout")), this.TIMEOUT_MS)
      );

      const testQuery = collection(db, "products");
      await Promise.race([getDocs(testQuery), timeoutPromise]);

      return true;
    } catch (error) {
      console.log("❌ Firebase connection failed:", error);
      return false;
    }
  }

  private static async testNeon(): Promise<boolean> {
    try {
      // Test connection to Neon/PostgreSQL via our API
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("❌ Neon PostgreSQL connection failed:", error);
      return false;
    }
  }

  private static setActiveDatabase(type: 'supabase' | 'firebase' | 'neon' | 'local') {
    localStorage.setItem('charnoks_active_database', type);
    
    if (type === 'local') {
      OfflineState.setFirebaseAccess(false);
      OfflineState.setOnlineStatus(false);
    } else {
      OfflineState.setFirebaseAccess(true);
      OfflineState.setOnlineStatus(true);
      // Clear demo mode when using real databases
      LocalStorageDB.disableDemoMode();
    }
  }

  private static setupCleanDemoMode() {
    // Clear all existing demo data
    LocalStorageDB.clearDemoData();
    
    // Enable demo mode but don't initialize with sample data
    LocalStorageDB.enableDemoMode();
    
    console.log("📱 Clean demo mode activated - no sample data loaded");
  }

  static getActiveDatabase(): string {
    return localStorage.getItem('charnoks_active_database') || 'local';
  }
}