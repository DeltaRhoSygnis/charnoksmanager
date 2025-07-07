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

    // No fallback to demo mode - require actual database connection
    console.error("❌ No database connections available. Please check your database configuration.");
    throw new Error("Database connection required. Please ensure your Supabase or Firebase configuration is correct.");
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

  private static setActiveDatabase(type: 'supabase' | 'firebase' | 'neon') {
    localStorage.setItem('charnoks_active_database', type);
    OfflineState.setFirebaseAccess(true);
    OfflineState.setOnlineStatus(true);
    // Always disable demo mode - we only use real databases
    LocalStorageDB.disableDemoMode();
  }

  static getActiveDatabase(): string {
    return localStorage.getItem('charnoks_active_database') || 'supabase';
  }
}