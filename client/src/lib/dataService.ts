import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { supabase } from "./supabase";
import { LocalStorageDB } from "./localStorageDB";
import { DatabasePriority } from "./databasePriority";
import { Product, Transaction } from "@/types/product";

export class DataService {
  static async getProducts(): Promise<Product[]> {
    const activeDb = DatabasePriority.getActiveDatabase();
    
    try {
      switch (activeDb) {
        case 'supabase':
          return await this.getProductsFromSupabase();
        case 'firebase':
          return await this.getProductsFromFirebase();
        case 'neon':
          return await this.getProductsFromNeon();
        default:
          return LocalStorageDB.getProducts();
      }
    } catch (error) {
      console.error(`Error fetching products from ${activeDb}:`, error);
      // Fallback to local storage
      return LocalStorageDB.getProducts();
    }
  }

  static async getTransactions(): Promise<Transaction[]> {
    const activeDb = DatabasePriority.getActiveDatabase();
    
    try {
      switch (activeDb) {
        case 'supabase':
          return await this.getTransactionsFromSupabase();
        case 'firebase':
          return await this.getTransactionsFromFirebase();
        case 'neon':
          return await this.getTransactionsFromNeon();
        default:
          return LocalStorageDB.getTransactions();
      }
    } catch (error) {
      console.error(`Error fetching transactions from ${activeDb}:`, error);
      // Fallback to local storage
      return LocalStorageDB.getTransactions();
    }
  }

  static async addProduct(product: Omit<Product, "id">): Promise<Product> {
    const activeDb = DatabasePriority.getActiveDatabase();
    
    try {
      switch (activeDb) {
        case 'supabase':
          return await this.addProductToSupabase(product);
        case 'firebase':
          return await this.addProductToFirebase(product);
        case 'neon':
          return await this.addProductToNeon(product);
        default:
          return LocalStorageDB.addProduct(product);
      }
    } catch (error) {
      console.error(`Error adding product to ${activeDb}:`, error);
      // Fallback to local storage
      return LocalStorageDB.addProduct(product);
    }
  }

  static async addTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
    const activeDb = DatabasePriority.getActiveDatabase();
    
    try {
      switch (activeDb) {
        case 'supabase':
          return await this.addTransactionToSupabase(transaction);
        case 'firebase':
          return await this.addTransactionToFirebase(transaction);
        case 'neon':
          return await this.addTransactionToNeon(transaction);
        default:
          return LocalStorageDB.addTransaction(transaction);
      }
    } catch (error) {
      console.error(`Error adding transaction to ${activeDb}:`, error);
      // Fallback to local storage
      return LocalStorageDB.addTransaction(transaction);
    }
  }

  // Firebase implementations
  private static async getProductsFromFirebase(): Promise<Product[]> {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  }

  private static async getTransactionsFromFirebase(): Promise<Transaction[]> {
    const q = query(collection(db, "sales"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Transaction[];
  }

  private static async addProductToFirebase(product: Omit<Product, "id">): Promise<Product> {
    const docRef = await addDoc(collection(db, "products"), product);
    return { id: docRef.id, ...product };
  }

  private static async addTransactionToFirebase(transaction: Omit<Transaction, "id">): Promise<Transaction> {
    const docRef = await addDoc(collection(db, "sales"), transaction);
    return { id: docRef.id, ...transaction };
  }

  // Supabase implementations
  private static async getProductsFromSupabase(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data || [];
  }

  private static async getTransactionsFromSupabase(): Promise<Transaction[]> {
    const { data, error } = await supabase.from('sales').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  private static async addProductToSupabase(product: Omit<Product, "id">): Promise<Product> {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) throw error;
    return data;
  }

  private static async addTransactionToSupabase(transaction: Omit<Transaction, "id">): Promise<Transaction> {
    const { data, error } = await supabase.from('sales').insert([transaction]).select().single();
    if (error) throw error;
    return data;
  }

  // Neon/PostgreSQL implementations (via API)
  private static async getProductsFromNeon(): Promise<Product[]> {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products from Neon');
    return await response.json();
  }

  private static async getTransactionsFromNeon(): Promise<Transaction[]> {
    const response = await fetch('/api/sales');
    if (!response.ok) throw new Error('Failed to fetch transactions from Neon');
    return await response.json();
  }

  private static async addProductToNeon(product: Omit<Product, "id">): Promise<Product> {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to add product to Neon');
    return await response.json();
  }

  private static async addTransactionToNeon(transaction: Omit<Transaction, "id">): Promise<Transaction> {
    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to add transaction to Neon');
    return await response.json();
  }
}