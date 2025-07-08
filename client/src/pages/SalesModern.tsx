import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Plus, Minus, CreditCard, Receipt, Search, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const SalesModern = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Get products data
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const addSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });
      if (!response.ok) throw new Error('Failed to record sale');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      toast({ title: 'Sale recorded successfully!' });
      setCart([]);
      setCustomerName('');
    },
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const saleData = {
      workerId: user?.uid,
      workerName: user?.email,
      customerName: customerName || 'Walk-in Customer',
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: cartTotal,
    };

    addSaleMutation.mutate(saleData);
  };

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modern-app-container">
      {/* Modern App Header */}
      <div className="modern-app-header">
        <div className="modern-app-title">
          🛒 Point of Sale
        </div>
        <div className="modern-app-subtitle">
          Process customer transactions quickly
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-32">
        {/* Cart Summary */}
        {cartItems > 0 && (
          <div className="modern-cart-summary">
            <div className="modern-cart-info">
              <div className="modern-cart-items">{cartItems} items</div>
              <div className="modern-cart-total">${cartTotal.toFixed(2)}</div>
            </div>
            <Button 
              onClick={handleCheckout}
              className="modern-btn-primary"
              disabled={addSaleMutation.isPending}
            >
              <CreditCard size={16} className="mr-2" />
              Checkout
            </Button>
          </div>
        )}

        {/* Customer Info */}
        <div className="modern-section">
          <div className="modern-section-title">Customer Information</div>
          <Input
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="modern-input"
          />
        </div>

        {/* Search Products */}
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
            <Button className="modern-btn-secondary">
              <Mic size={16} />
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="modern-section">
          <div className="modern-section-title">
            Products ({filteredProducts.length})
          </div>
          <div className="modern-product-grid">
            {isLoading ? (
              <div className="modern-loading-skeleton">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="modern-skeleton-product" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product: any) => {
                const inCart = cart.find(item => item.id === product.id);
                return (
                  <div key={product.id} className="modern-product-tile">
                    <div className="modern-product-tile-header">
                      <div className="modern-product-tile-name">{product.name}</div>
                      <div className="modern-product-tile-price">${product.price}</div>
                    </div>
                    {product.category && (
                      <div className="modern-product-tile-category">{product.category}</div>
                    )}
                    <div className="modern-product-tile-stock">
                      Stock: {product.stock}
                    </div>
                    
                    {inCart ? (
                      <div className="modern-quantity-controls">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
                          className="modern-quantity-btn"
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="modern-quantity-display">{inCart.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
                          className="modern-quantity-btn"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToCart(product)}
                        className="modern-add-to-cart-btn"
                        disabled={product.stock <= 0}
                      >
                        <Plus size={14} className="mr-1" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="modern-empty-state col-span-full">
                <div className="modern-empty-icon">🛒</div>
                <div className="modern-empty-title">No products found</div>
                <div className="modern-empty-subtitle">
                  {searchTerm ? 'Try adjusting your search' : 'No products available for sale'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Details */}
        {cart.length > 0 && (
          <div className="modern-section">
            <div className="modern-section-title">Cart ({cartItems} items)</div>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="modern-cart-item">
                  <div className="modern-cart-item-info">
                    <div className="modern-cart-item-name">{item.name}</div>
                    <div className="modern-cart-item-price">
                      ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="modern-cart-item-controls">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="modern-quantity-btn"
                    >
                      <Minus size={12} />
                    </Button>
                    <span className="modern-quantity-display-small">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="modern-quantity-btn"
                    >
                      <Plus size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, 0)}
                      className="modern-remove-btn"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Checkout Bar */}
      {cartItems > 0 && (
        <div className="modern-checkout-bar">
          <div className="modern-checkout-info">
            <div className="modern-checkout-items">{cartItems} items</div>
            <div className="modern-checkout-total">Total: ${cartTotal.toFixed(2)}</div>
          </div>
          <Button 
            onClick={handleCheckout}
            className="modern-checkout-btn"
            disabled={addSaleMutation.isPending}
          >
            <Receipt size={16} className="mr-2" />
            {addSaleMutation.isPending ? 'Processing...' : 'Complete Sale'}
          </Button>
        </div>
      )}
    </div>
  );
};