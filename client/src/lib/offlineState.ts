import { LocalStorageDB } from "./localStorageDB";

// Offline state management with local storage fallback
export class OfflineState {
  private static isOnline = true;
  private static listeners: ((isOnline: boolean) => void)[] = [];
  private static firebaseAccessible = true;

  static setOnlineStatus(online: boolean) {
    this.isOnline = online;
    this.listeners.forEach((listener) => listener(online));
  }

  static getOnlineStatus() {
    return this.isOnline;
  }

  static setFirebaseAccess(hasAccess: boolean) {
    this.firebaseAccessible = hasAccess;
    if (!hasAccess) {
      this.setOnlineStatus(false);
      LocalStorageDB.enableDemoMode();
    } else {
      this.setOnlineStatus(true);
      LocalStorageDB.disableDemoMode();
    }
  }

  static hasFirebaseAccess() {
    return this.firebaseAccessible;
  }

  static addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Check if error is network-related
  static isNetworkError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || "";
    const errorCode = error.code?.toLowerCase() || "";

    const isNetworkError =
      errorCode.includes("network") ||
      errorCode.includes("permission-denied") ||
      errorCode.includes("insufficient-permissions") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("permission") ||
      (error instanceof TypeError && errorMessage.includes("fetch"));

    if (isNetworkError) {
      this.setFirebaseAccess(false);
    }

    return isNetworkError;
  }

  // Get data from local storage when Firebase is unavailable
  static getLocalData(type: "products" | "transactions" | "users") {
    switch (type) {
      case "products":
        return LocalStorageDB.getProducts();
      case "transactions":
        return LocalStorageDB.getTransactions();
      case "users":
        return LocalStorageDB.getUsers();
      default:
        return [];
    }
  }

  // Get demo stats
  static getDemoStats() {
    return LocalStorageDB.calculateStats();
  }

  // Initialize network monitoring
  static initializeNetworkMonitoring() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.setOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.setOnlineStatus(false);
    });

    // Set initial status
    this.setOnlineStatus(navigator.onLine);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => OfflineState.setOnlineStatus(true));
  window.addEventListener("offline", () => OfflineState.setOnlineStatus(false));
}