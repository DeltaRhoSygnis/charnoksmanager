// Mock storage for when database is not available
import { type User, type InsertUser, type Product, type InsertProduct, type Sale, type InsertSale, type Expense, type InsertExpense } from "@shared/schema";
import { IStorage } from "./storage";

export class MockStorage implements IStorage {
  private users: User[] = [
    { id: 1, username: 'owner', email: 'owner@demo.com', password: 'demo', role: 'owner', createdBy: null, createdAt: new Date() }
  ];
  
  private products: Product[] = [
    { id: 1, name: 'Sample Chicken', price: '15.99', stock: 50, category: 'Food', imageUrl: null, description: 'Delicious fried chicken', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'Sample Drink', price: '2.50', stock: 100, category: 'Beverage', imageUrl: null, description: 'Refreshing drink', isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ];
  
  private sales: Sale[] = [
    { id: 1, items: JSON.stringify([{name: 'Sample Chicken', quantity: 2, price: 15.99}]), totalAmount: '31.98', amountPaid: '35.00', change: '3.02', paymentMethod: 'cash', workerId: 1, workerEmail: 'worker@demo.com', isVoiceTransaction: false, voiceInput: null, status: 'completed', createdAt: new Date() }
  ];
  
  private expenses: Expense[] = [
    { id: 1, description: 'Sample Expense', amount: '10.00', category: 'Supplies', notes: 'Demo expense', workerId: 1, workerEmail: 'worker@demo.com', receiptUrl: null, createdAt: new Date() }
  ];

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: Math.max(...this.users.map(u => u.id), 0) + 1,
      ...user,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return this.products.filter(p => p.isActive);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.find(p => p.id === id && p.isActive);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: Math.max(...this.products.map(p => p.id), 0) + 1,
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    this.products[index] = { ...this.products[index], ...product, updatedAt: new Date() };
    return this.products[index];
  }

  async deleteProduct(id: number): Promise<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index].isActive = false;
      this.products[index].updatedAt = new Date();
    }
  }

  // Sales operations
  async getSales(): Promise<Sale[]> {
    return this.sales;
  }

  async getSalesByWorker(workerId: number): Promise<Sale[]> {
    return this.sales.filter(s => s.workerId === workerId);
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const newSale: Sale = {
      id: Math.max(...this.sales.map(s => s.id), 0) + 1,
      ...sale,
      createdAt: new Date()
    };
    this.sales.push(newSale);
    return newSale;
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    return this.expenses;
  }

  async getExpensesByWorker(workerId: number): Promise<Expense[]> {
    return this.expenses.filter(e => e.workerId === workerId);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const newExpense: Expense = {
      id: Math.max(...this.expenses.map(e => e.id), 0) + 1,
      ...expense,
      createdAt: new Date()
    };
    this.expenses.push(newExpense);
    return newExpense;
  }
}