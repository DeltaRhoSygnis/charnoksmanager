// API client for Express backend endpoints
const API_BASE = '';

export const api = {
  // Health check
  health: () => fetch(`${API_BASE}/api/health`).then(res => res.json()),

  // Products
  products: {
    getAll: () => fetch(`${API_BASE}/api/products`).then(res => res.json()),
    getById: (id: number) => fetch(`${API_BASE}/api/products/${id}`).then(res => res.json()),
    create: (product: any) => fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }).then(res => res.json()),
    update: (id: number, product: any) => fetch(`${API_BASE}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }).then(res => res.json()),
    delete: (id: number) => fetch(`${API_BASE}/api/products/${id}`, {
      method: 'DELETE'
    }).then(res => res.json())
  },

  // Sales
  sales: {
    getAll: () => fetch(`${API_BASE}/api/sales`).then(res => res.json()),
    getByWorker: (workerId: number) => fetch(`${API_BASE}/api/sales/worker/${workerId}`).then(res => res.json()),
    create: (sale: any) => fetch(`${API_BASE}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale)
    }).then(res => res.json())
  },

  // Expenses
  expenses: {
    getAll: () => fetch(`${API_BASE}/api/expenses`).then(res => res.json()),
    getByWorker: (workerId: number) => fetch(`${API_BASE}/api/expenses/worker/${workerId}`).then(res => res.json()),
    create: (expense: any) => fetch(`${API_BASE}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    }).then(res => res.json())
  },

  // Analytics
  analytics: {
    getSummary: () => fetch(`${API_BASE}/api/analytics/summary`).then(res => res.json()),
    getTransactions: () => fetch(`${API_BASE}/api/analytics/transactions`).then(res => res.json()),
    getSalesOverTime: (period = '7') => fetch(`${API_BASE}/api/analytics/charts/sales-over-time?period=${period}`).then(res => res.json()),
    getTopProducts: () => fetch(`${API_BASE}/api/analytics/top-products`).then(res => res.json())
  }
};