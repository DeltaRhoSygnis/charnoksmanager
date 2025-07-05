
import { StorageManager, STORAGE_STRATEGY } from './storageStrategy';
import { LocalStorageDB } from './localStorageDB';

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

  // Placeholder for Supabase operations (implement when you have credentials)
  private static async saveToSupabase(dataType: string, data: any) {
    // TODO: Implement Supabase operations when credentials are available
    console.log(`Would save ${dataType} to Supabase:`, data);
    throw new Error('Supabase not configured yet');
  }

  private static async getFromSupabase(dataType: string) {
    // TODO: Implement Supabase operations when credentials are available
    console.log(`Would get ${dataType} from Supabase`);
    throw new Error('Supabase not configured yet');
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
