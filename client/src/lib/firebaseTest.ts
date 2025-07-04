import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { OfflineState } from "./offlineState";
import { LocalStorageDB } from "./localStorageDB";

export class FirebaseTest {
  // Test if Firebase is accessible by attempting a simple read operation
  static async testFirebaseAccess(): Promise<boolean> {
    try {
      console.log("Testing Firebase connectivity...");

      // Faster timeout for better UX (3 seconds instead of 5)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firebase timeout")), 3000),
      );

      // Try to read from a collection (this will fail if permissions are wrong)
      const testQuery = collection(db, "products");
      await Promise.race([getDocs(testQuery), timeoutPromise]);

      console.log("✅ Firebase access successful!");
      OfflineState.setFirebaseAccess(true);
      OfflineState.setOnlineStatus(true);

      // Disable demo mode since Firebase is working
      localStorage.removeItem("charnoks_demo_mode");

      return true;
    } catch (error: any) {
      console.log("🔄 Falling back to demo mode");
      console.log("📱 Using demo mode with local storage.");
      OfflineState.setFirebaseAccess(false);
      LocalStorageDB.enableDemoMode();
      return false;
    }
  }

  // Test write permissions
  static async testWriteAccess(): Promise<boolean> {
    try {
      // Try to write a test document
      const testDoc = {
        test: true,
        timestamp: new Date(),
        type: "connectivity_test",
      };

      await addDoc(collection(db, "test"), testDoc);
      console.log("✅ Firebase write access successful!");
      return true;
    } catch (error: any) {
      console.error("❌ Firebase write access failed:", error);
      return false;
    }
  }

  // Initialize Firebase connectivity check
  static async initialize() {
    const hasAccess = await this.testFirebaseAccess();

    if (hasAccess) {
      console.log("🚀 Firebase is ready! Using real database.");
      // Optionally test write access
      await this.testWriteAccess();
    } else {
      console.log("📱 Using demo mode with local storage.");
    }

    return hasAccess;
  }
}
