import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Edit, Trash2, Search, Filter, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const ProductsModern = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Get products data
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to add product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: 'Product added successfully!' });
      setShowAddProduct(false);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: 'Product deleted successfully!' });
    },
  });

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modern-app-container">
      {/* Modern App Header */}
      <div className="modern-app-header">
        <div className="modern-app-title">
          📦 Products
        </div>
        <div className="modern-app-subtitle">
          Manage your inventory and menu items
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        {/* Quick Stats */}
        <div className="modern-stats-grid">
          <div className="modern-stats-card">
            <div className="modern-stats-icon">📦</div>
            <div className="modern-stats-value">{products.length}</div>
            <div className="modern-stats-label">Total Products</div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">📊</div>
            <div className="modern-stats-value">{products.filter((p: any) => p.stock < 10).length}</div>
            <div className="modern-stats-label">Low Stock</div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">💰</div>
            <div className="modern-stats-value">${products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0).toFixed(0)}</div>
            <div className="modern-stats-label">Total Value</div>
          </div>
          <div className="modern-stats-card">
            <div className="modern-stats-icon">🏷️</div>
            <div className="modern-stats-value">{new Set(products.map((p: any) => p.category)).size}</div>
            <div className="modern-stats-label">Categories</div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="modern-section">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 modern-input"
              />
            </div>
            <Button 
              onClick={() => setShowAddProduct(true)}
              className="modern-btn-primary"
            >
              <Plus size={16} className="mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Products List */}
        <div className="modern-section">
          <div className="modern-section-title">
            Product Inventory ({filteredProducts.length})
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="modern-loading-skeleton">
                {[1, 2, 3].map(i => (
                  <div key={i} className="modern-skeleton-card" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => (
                <div key={product.id} className="modern-product-card">
                  <div className="modern-product-info">
                    <div className="modern-product-name">{product.name}</div>
                    <div className="modern-product-details">
                      <span className="modern-product-price">${product.price}</span>
                      <span className="modern-product-separator">•</span>
                      <span className="modern-product-stock">
                        Stock: {product.stock}
                        {product.stock < 10 && (
                          <span className="modern-low-stock-badge">Low</span>
                        )}
                      </span>
                    </div>
                    {product.category && (
                      <div className="modern-product-category">{product.category}</div>
                    )}
                  </div>
                  <div className="modern-product-actions">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="modern-action-btn"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="modern-action-btn modern-action-btn-danger"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="modern-empty-state">
                <div className="modern-empty-icon">📦</div>
                <div className="modern-empty-title">No products found</div>
                <div className="modern-empty-subtitle">
                  {searchTerm ? 'Try adjusting your search' : 'Start by adding your first product'}
                </div>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowAddProduct(true)}
                    className="modern-btn-primary mt-4"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Categories */}
        <div className="modern-section">
          <div className="modern-section-title">Quick Categories</div>
          <div className="modern-category-grid">
            {['Chicken', 'Sides', 'Drinks', 'Desserts'].map((category) => {
              const categoryProducts = products.filter((p: any) => 
                p.category?.toLowerCase() === category.toLowerCase()
              );
              return (
                <div key={category} className="modern-category-card">
                  <div className="modern-category-name">{category}</div>
                  <div className="modern-category-count">{categoryProducts.length} items</div>
                  <ArrowRight className="modern-category-arrow" size={14} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Product Modal would go here */}
      {showAddProduct && (
        <AddProductModal 
          onClose={() => setShowAddProduct(false)}
          onAdd={(data) => addProductMutation.mutate(data)}
        />
      )}
    </div>
  );
};

// Simple Add Product Modal Component
const AddProductModal = ({ onClose, onAdd }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    });
  };

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal">
        <div className="modern-modal-header">
          <h3 className="modern-modal-title">Add New Product</h3>
          <Button variant="ghost" onClick={onClose} className="modern-modal-close">
            ×
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="modern-modal-content">
          <div className="space-y-4">
            <div>
              <label className="modern-label">Product Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="modern-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="modern-label">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="modern-input"
                  required
                />
              </div>
              <div>
                <label className="modern-label">Stock</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="modern-input"
                  required
                />
              </div>
            </div>
            <div>
              <label className="modern-label">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="modern-input"
                placeholder="e.g., Chicken, Sides, Drinks"
              />
            </div>
          </div>
          <div className="modern-modal-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="modern-btn-primary">
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};