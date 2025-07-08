import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertSaleSchema, insertExpenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Test database connection
      await storage.getProducts();
      res.json({ status: "healthy", database: "connected" });
    } catch (error: any) {
      res.status(500).json({ status: "unhealthy", error: error.message });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/username/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sales/worker/:workerId", async (req, res) => {
    try {
      const workerId = parseInt(req.params.workerId);
      const sales = await storage.getSalesByWorker(workerId);
      res.json(sales);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      res.json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/expenses/worker/:workerId", async (req, res) => {
    try {
      const workerId = parseInt(req.params.workerId);
      const expenses = await storage.getExpensesByWorker(workerId);
      res.json(expenses);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Analytics and Dashboard endpoints
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const [sales, expenses, products] = await Promise.all([
        storage.getSales(),
        storage.getExpenses(),
        storage.getProducts()
      ]);

      const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount?.toString() || '0'), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount?.toString() || '0'), 0);
      const netProfit = totalSales - totalExpenses;

      // Calculate today's revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysRevenue = sales
        .filter(sale => sale.createdAt && new Date(sale.createdAt) >= today)
        .reduce((sum, sale) => sum + parseFloat(sale.totalAmount?.toString() || '0'), 0);

      res.json({
        totalSales,
        totalExpenses,
        netProfit,
        todaysRevenue,
        totalProducts: products.length,
        totalTransactions: sales.length + expenses.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/transactions", async (req, res) => {
    try {
      const [sales, expenses] = await Promise.all([
        storage.getSales(),
        storage.getExpenses()
      ]);

      // Convert to unified transaction format
      const transactions = [
        ...sales.map(sale => ({
          id: `sale_${sale.id}`,
          type: 'sale' as const,
          amount: parseFloat(sale.totalAmount?.toString() || '0'),
          description: `Sale - ${sale.items ? JSON.parse(sale.items as string).length : 0} items`,
          timestamp: sale.createdAt || new Date(),
          workerId: sale.workerId
        })),
        ...expenses.map(expense => ({
          id: `expense_${expense.id}`,
          type: 'expense' as const,
          amount: parseFloat(expense.amount?.toString() || '0'),
          description: expense.description || 'Expense',
          timestamp: expense.createdAt || new Date(),
          workerId: expense.workerId
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/charts/sales-over-time", async (req, res) => {
    try {
      const { period = '7' } = req.query;
      const days = parseInt(period as string);
      
      const sales = await storage.getSales();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Group sales by date
      const salesByDate: { [key: string]: { sales: number; transactions: number } } = {};
      
      sales
        .filter(sale => sale.createdAt && new Date(sale.createdAt) >= startDate)
        .forEach(sale => {
          const dateKey = new Date(sale.createdAt!).toISOString().split('T')[0];
          if (!salesByDate[dateKey]) {
            salesByDate[dateKey] = { sales: 0, transactions: 0 };
          }
          salesByDate[dateKey].sales += parseFloat(sale.totalAmount?.toString() || '0');
          salesByDate[dateKey].transactions += 1;
        });

      const chartData = Object.entries(salesByDate).map(([date, data]) => ({
        date,
        sales: data.sales,
        transactions: data.transactions
      })).sort((a, b) => a.date.localeCompare(b.date));

      res.json(chartData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/top-products", async (req, res) => {
    try {
      const sales = await storage.getSales();
      const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};

      sales.forEach(sale => {
        if (sale.items) {
          try {
            const items = JSON.parse(sale.items);
            items.forEach((item: any) => {
              const key = item.name || 'Unknown Product';
              if (!productSales[key]) {
                productSales[key] = { name: key, quantity: 0, revenue: 0 };
              }
              productSales[key].quantity += item.quantity || 0;
              productSales[key].revenue += (item.quantity || 0) * (item.price || 0);
            });
          } catch (e) {
            // Skip invalid JSON
          }
        }
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      res.json(topProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
