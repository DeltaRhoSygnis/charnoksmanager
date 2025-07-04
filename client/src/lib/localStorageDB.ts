// Local storage database fallback for when Firestore is unavailable
import { Product, Transaction } from "@/types/product";

export class LocalStorageDB {
  private static readonly KEYS = {
    PRODUCTS: "charnoks_products",
    TRANSACTIONS: "charnoks_transactions",
    USERS: "charnoks_users",
    DEMO_MODE: "charnoks_demo_mode",
  };

  // Enable demo mode with sample data
  static enableDemoMode() {
    localStorage.setItem(this.KEYS.DEMO_MODE, "true");
    this.initializeDemoData();
  }

  static isDemoMode(): boolean {
    return localStorage.getItem(this.KEYS.DEMO_MODE) === "true";
  }

  // Disable demo mode and clear demo data
  static disableDemoMode() {
    localStorage.removeItem(this.KEYS.DEMO_MODE);
    this.clearDemoData();
  }

  // Initialize with sample data for demo
  private static initializeDemoData() {
    // Sample products
    const sampleProducts: Product[] = [
      {
        id: "demo-1",
        name: "Coca Cola",
        price: 15,
        stock: 100,
        category: "Beverages",
        imageUrl: "/api/placeholder/150/150",
        description: "Classic Coca Cola 355ml",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "demo-2",
        name: "Piattos",
        price: 25,
        stock: 50,
        category: "Snacks",
        imageUrl: "/api/placeholder/150/150",
        description: "Piattos Cheese Flavored Potato Crisps",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "demo-3",
        name: "Bottled Water",
        price: 10,
        stock: 200,
        category: "Beverages",
        imageUrl: "/api/placeholder/150/150",
        description: "Pure Drinking Water 500ml",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "demo-4",
        name: "Biscuits",
        price: 20,
        stock: 75,
        category: "Snacks",
        imageUrl: "/api/placeholder/150/150",
        description: "Assorted Cream Biscuits",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "demo-5",
        name: "Instant Coffee",
        price: 30,
        stock: 40,
        category: "Beverages",
        imageUrl: "/api/placeholder/150/150",
        description: "3-in-1 Instant Coffee Mix",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Sample transactions
    const now = new Date();
    const sampleTransactions: Transaction[] = [
      {
        type: "sale",
        id: "demo-trans-1",
        items: [
          {
            productId: "demo-1",
            productName: "Coca Cola",
            quantity: 2,
            price: 15,
            total: 30,
          },
          {
            productId: "demo-2",
            productName: "Piattos",
            quantity: 1,
            price: 25,
            total: 25,
          },
        ],
        totalAmount: 55,
        amountPaid: 100,
        change: 45,
        paymentMethod: "cash",
        workerId: "demo-worker",
        workerEmail: "worker@demo.com",
        timestamp: new Date(now.getTime() - 1000 * 60 * 30), // 30 minutes ago
        isVoiceTransaction: true,
        voiceInput: "2 Coke and 1 Piattos, 100 pesos",
        status: "completed",
      },
      {
        type: "sale",
        id: "demo-trans-2",
        items: [
          {
            productId: "demo-3",
            productName: "Bottled Water",
            quantity: 3,
            price: 10,
            total: 30,
          },
        ],
        totalAmount: 30,
        amountPaid: 50,
        change: 20,
        paymentMethod: "cash",
        workerId: "demo-worker",
        workerEmail: "worker@demo.com",
        timestamp: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
        isVoiceTransaction: false,
        status: "completed",
      },
      {
        type: "sale",
        id: "demo-trans-3",
        items: [
          {
            productId: "demo-4",
            productName: "Biscuits",
            quantity: 1,
            price: 20,
            total: 20,
          },
          {
            productId: "demo-5",
            productName: "Instant Coffee",
            quantity: 2,
            price: 30,
            total: 60,
          },
        ],
        totalAmount: 80,
        amountPaid: 100,
        change: 20,
        paymentMethod: "cash",
        workerId: "demo-worker2",
        workerEmail: "worker2@demo.com",
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
        isVoiceTransaction: false,
        status: "completed",
      },
    ];

    this.saveProducts(sampleProducts);
    this.saveTransactions(sampleTransactions);
  }

  // Products operations
  static getProducts(): Product[] {
    const data = localStorage.getItem(this.KEYS.PRODUCTS);
    if (!data) return [];

    try {
      const products = JSON.parse(data);
      return products.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch {
      return [];
    }
  }

  static saveProducts(products: Product[]) {
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
  }

  static addProduct(product: Omit<Product, "id">) {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: "local-" + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index >= 0) {
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  }

  static deleteProduct(id: string) {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);
  }

  // Transactions operations
  static getTransactions(): Transaction[] {
    const data = localStorage.getItem(this.KEYS.TRANSACTIONS);
    if (!data) return [];

    try {
      const transactions = JSON.parse(data);
      return transactions.map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp),
      }));
    } catch {
      return [];
    }
  }

  static saveTransactions(transactions: Transaction[]) {
    localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  static addTransaction(transaction: Omit<Transaction, "id">) {
    const transactions = this.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: "local-" + Date.now(),
    };
    transactions.unshift(newTransaction); // Add to beginning for chronological order
    this.saveTransactions(transactions);
    return newTransaction;
  }

  // Users operations (for worker list)
  static getUsers() {
    const data = localStorage.getItem(this.KEYS.USERS);
    if (!data) {
      // Return demo users
      return [
        { id: "demo-worker", email: "worker@demo.com", role: "worker" },
        { id: "demo-worker2", email: "worker2@demo.com", role: "worker" },
      ];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveUsers(users: any[]) {
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
  }

  // Statistics calculations
  static calculateStats() {
    const transactions = this.getTransactions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSales = transactions.reduce((sum, t) => sum + (t.totalAmount || t.amount || 0), 0);
    const totalTransactions = transactions.length;
    const todaysTransactions = transactions.filter((t) => t.timestamp >= today);
    const todaysRevenue = todaysTransactions.reduce(
      (sum, t) => sum + (t.totalAmount || t.amount || 0),
      0,
    );
    const voiceTransactions = transactions.filter(
      (t) => t.isVoiceTransaction,
    ).length;
    const workers = this.getUsers().filter((u: any) => u.role === "worker");

    return {
      totalSales,
      totalExpenses: 0, // Not implemented in demo
      totalWorkers: workers.length,
      todaysRevenue,
      totalTransactions,
      voiceTransactions,
      averageTransaction:
        totalTransactions > 0 ? totalSales / totalTransactions : 0,
    };
  }

  // Clear all demo data
  static clearDemoData() {
    Object.values(this.KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

// Note: Demo mode removed - app now uses Firebase directly
