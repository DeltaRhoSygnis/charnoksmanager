// Utility to clear all cached/demo data for testing
export class DataCleaner {
  static clearAllLocalData() {
    // Clear demo mode data
    localStorage.removeItem('charnoks_demo_mode');
    localStorage.removeItem('charnoks_demo_products');
    localStorage.removeItem('charnoks_demo_transactions');
    localStorage.removeItem('charnoks_demo_users');
    
    // Clear other cached data
    localStorage.removeItem('charnoks_active_database');
    localStorage.removeItem('charnoks_user_role');
    
    console.log("🧹 Cleared all local/demo data");
  }

  static forceRefresh() {
    this.clearAllLocalData();
    
    // Force page refresh to clear any cached state
    window.location.reload();
  }
}