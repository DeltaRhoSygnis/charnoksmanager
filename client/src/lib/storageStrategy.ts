
export interface StorageConfig {
  primary: 'supabase' | 'firebase' | 'local';
  fallback: 'local' | 'firebase';
  syncEnabled: boolean;
}

export const STORAGE_STRATEGY = {
  // User Authentication & Profiles
  auth: {
    primary: 'supabase', // Supabase Auth with PostgreSQL
    fallback: 'firebase', // Firebase Auth as fallback
    syncEnabled: true
  },
  
  // Product Catalog
  products: {
    primary: 'supabase', // PostgreSQL for complex queries
    fallback: 'local', // Local storage for offline
    syncEnabled: true
  },
  
  // Transactional Data
  transactions: {
    primary: 'supabase', // PostgreSQL for ACID compliance
    fallback: 'local', // Queue for offline transactions
    syncEnabled: true
  },
  
  // Session Data
  sessions: {
    primary: 'local', // Browser storage for speed
    fallback: 'supabase', // PostgreSQL for persistence
    syncEnabled: false
  },
  
  // Media Assets
  media: {
    primary: 'supabase', // Supabase Storage
    fallback: 'local', // Base64 fallback
    syncEnabled: true
  }
} as const;

export class StorageManager {
  static getStrategy(dataType: keyof typeof STORAGE_STRATEGY) {
    return STORAGE_STRATEGY[dataType];
  }
  
  static isOnline(): boolean {
    return navigator.onLine;
  }
  
  static shouldUseOffline(dataType: keyof typeof STORAGE_STRATEGY): boolean {
    const strategy = this.getStrategy(dataType);
    return !this.isOnline() && strategy.fallback === 'local';
  }
}
