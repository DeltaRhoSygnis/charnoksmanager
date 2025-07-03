// Simple offline state management for when Firebase is unavailable
export class OfflineState {
  private static isOnline = true;
  private static listeners: ((isOnline: boolean) => void)[] = [];

  static setOnlineStatus(online: boolean) {
    this.isOnline = online;
    this.listeners.forEach((listener) => listener(online));
  }

  static getOnlineStatus() {
    return this.isOnline;
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

    return (
      errorCode.includes("network") ||
      errorCode.includes("permission-denied") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      (error instanceof TypeError && errorMessage.includes("fetch"))
    );
  }

  // Mock data for offline mode
  static getMockData(type: "sales" | "expenses" | "products" | "users") {
    const mockData = {
      sales: [],
      expenses: [],
      products: [{ id: "1", name: "Sample Product", price: 10, stock: 100 }],
      users: [],
    };

    return mockData[type] || [];
  }
}

// Monitor network status
if (typeof window !== "undefined") {
  window.addEventListener("online", () => OfflineState.setOnlineStatus(true));
  window.addEventListener("offline", () => OfflineState.setOnlineStatus(false));
}
