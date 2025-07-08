import { users, products, sales, expenses, type User, type InsertUser, type Product, type InsertProduct, type Sale, type InsertSale, type Expense, type InsertExpense } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { MockStorage } from "./mock-storage";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Sales operations
  getSales(): Promise<Sale[]>;
  getSalesByWorker(workerId: number): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Expense operations
  getExpenses(): Promise<Expense[]>;
  getExpensesByWorker(workerId: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  // Sales operations
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales);
  }

  async getSalesByWorker(workerId: number): Promise<Sale[]> {
    return await db.select().from(sales).where(eq(sales.workerId, workerId));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db
      .insert(sales)
      .values(sale)
      .returning();
    return newSale;
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses);
  }

  async getExpensesByWorker(workerId: number): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.workerId, workerId));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values(expense)
      .returning();
    return newExpense;
  }
}

// Create storage instance with fallback to mock data
async function createStorage(): Promise<IStorage> {
  try {
    // Test database connection
    await db.select().from(users).limit(1);
    console.log('✅ Using database storage');
    return new DatabaseStorage();
  } catch (error) {
    console.log('⚠️  Database unavailable, using mock storage with sample data');
    return new MockStorage();
  }
}

export const storage = await createStorage();
