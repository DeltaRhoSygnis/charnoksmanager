
import { StorageManager, STORAGE_STRATEGY } from './storageStrategy';
import { LocalStorageDB } from './localStorageDB';
import { supabase, isSupabaseConfigured } from './supabase';

export class HybridStorage {
  private static isOnline(): boolean {
    return navigator.onLine;
  }

  // Universal data operations that route to appropriate storage
  static async saveData(dataType: keyof typeof STORAGE_STRATEGY, data: any) {
    const strategy = StorageManager.getStrategy(dataType);
    
    try {
      if (this.isOnline() && strategy.primary === 'supabase') {
        // Try primary storage first
        await this.saveToSupabase(dataType, data);
        
        // Cache locally for offline access
        if (strategy.fallback === 'local') {
          this.saveToLocal(dataType, data);
        }
      } else {
        // Offline or primary unavailable - use fallback
        this.saveToLocal(dataType, data);
        
        // Queue for sync when online
        if (strategy.syncEnabled) {
          this.queueForSync(dataType, data);
        }
      }
    } catch (error) {
      console.warn(`Primary storage failed for ${dataType}, using fallback:`, error);
      this.saveToLocal(dataType, data);
      
      if (strategy.syncEnabled) {
        this.queueForSync(dataType, data);
      }
    }
  }

  static async getData(dataType: keyof typeof STORAGE_STRATEGY) {
    const strategy = StorageManager.getStrategy(dataType);
    
    try {
      if (this.isOnline() && strategy.primary === 'supabase') {
        return await this.getFromSupabase(dataType);
      } else {
        return this.getFromLocal(dataType);
      }
    } catch (error) {
      console.warn(`Primary storage failed for ${dataType}, using fallback:`, error);
      return this.getFromLocal(dataType);
    }
  }

  // Local storage operations (immediate fallback)
  private static saveToLocal(dataType: string, data: any) {
    switch (dataType) {
      case 'products':
        if (Array.isArray(data)) {
          data.forEach(product => LocalStorageDB.addProduct(product));
        } else {
          LocalStorageDB.addProduct(data);
        }
        break;
      case 'transactions':
        LocalStorageDB.addTransaction(data);
        break;
      case 'sessions':
        localStorage.setItem(`session_${dataType}`, JSON.stringify(data));
        break;
      default:
        localStorage.setItem(dataType, JSON.stringify(data));
    }
  }

  private static getFromLocal(dataType: string) {
    switch (dataType) {
      case 'products':
        return LocalStorageDB.getProducts();
      case 'transactions':
        return LocalStorageDB.getTransactions();
      case 'sessions':
        const sessionData = localStorage.getItem(`session_${dataType}`);
        return sessionData ? JSON.parse(sessionData) : null;
      default:
        const data = localStorage.getItem(dataType);
        return data ? JSON.parse(data) : null;
    }
  }

  // Supabase operations
  private static async saveToSupabase(dataType: string, data: any) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - missing environment variables');
    }

    switch (dataType) {
      case 'products':
        if (Array.isArray(data)) {
          const { error } = await supabase.from('products').upsert(data);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('products').upsert(data);
          if (error) throw error;
        }
        break;
      
      case 'transactions':
        const { error } = await supabase.from('transactions').insert(data);
        if (error) throw error;
        break;
      
      case 'auth':
        // Handle authentication data
        if (data.email && data.password) {
          const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password
          });
          if (error) throw error;
        }
        break;
      
      default:
        console.warn(`No Supabase handler for dataType: ${dataType}`);
    }
  }

  private static async getFromSupabase(dataType: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured - missing environment variables');
    }

    switch (dataType) {
      case 'products':
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('isActive', true);
        if (productsError) throw productsError;
        return products;
      
      case 'transactions':
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('timestamp', { ascending: false });
        if (transactionsError) throw transactionsError;
        return transactions;
      
      case 'auth':
        const { data: { user } } = await supabase.auth.getUser();
        return user;
      
      default:
        console.warn(`No Supabase handler for dataType: ${dataType}`);
        return null;
    }
  }

  // Sync queue for offline operations
  private static queueForSync(dataType: string, data: any) {
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    queue.push({
      dataType,
      data,
      timestamp: Date.now(),
      operation: 'save'
    });
    localStorage.setItem('syncQueue', JSON.stringify(queue));
  }

  // Process sync queue when back online
  static async processSyncQueue() {
    if (!this.isOnline()) return;

    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    const processed = [];

    for (const item of queue) {
      try {
        await this.saveToSupabase(item.dataType, item.data);
        processed.push(item);
      } catch (error) {
        console.warn('Failed to sync item:', item, error);
        break; // Stop processing if we hit an error
      }
    }

    // Remove processed items from queue
    const remaining = queue.filter(item => !processed.includes(item));
    localStorage.setItem('syncQueue', JSON.stringify(remaining));
  }
}

// Auto-sync when coming back online
window.addEventListener('online', () => {
  console.log('Back online - processing sync queue');
  HybridStorage.processSyncQueue();
});
