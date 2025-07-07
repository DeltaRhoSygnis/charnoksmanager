import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Package, 
  Calculator, 
  DollarSign, 
  Save, 
  X, 
  Check,
  Grid3X3,
  List,
  Search
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

interface SaleData {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  payment: number;
  change: number;
  workerId: string;
  workerEmail: string;
  timestamp: Date;
}

export const StreamlinedSalesInterface = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [payment, setPayment] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { DataService } = await import("@/lib/dataService");
      const fetchedProducts = await DataService.getProducts();
      setProducts(fetchedProducts.filter(p => p.isActive && p.stock > 0));
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.price * quantity;
  };

  const calculateChange = () => {
    const total = calculateTotal();
    return payment - total;
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setPayment(0);
  };

  const handleSaveSale = async () => {
    if (!selectedProduct || !user) {
      toast({
        title: "Error",
        description: "Please select a product and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    const total = calculateTotal();
    
    if (payment < total) {
      toast({
        title: "Insufficient Payment",
        description: `Payment (₱${payment}) is less than total (₱${total.toFixed(2)})`,
        variant: "destructive",
      });
      return;
    }

    if (quantity > selectedProduct.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${selectedProduct.stock} units available`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const saleData: SaleData = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity,
        total: total,
        payment: payment,
        change: calculateChange(),
        workerId: user.uid,
        workerEmail: user.email || 'Unknown Worker',
        timestamp: new Date(),
      };

      // Save using DataService
      const { DataService } = await import("@/lib/dataService");
      await DataService.addTransaction({
        type: 'sale',
        items: [{
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          quantity: quantity,
          price: selectedProduct.price,
          total: total
        }],
        totalAmount: total,
        amountPaid: payment,
        change: calculateChange(),
        paymentMethod: 'cash',
        workerId: user.uid,
        workerEmail: user.email || 'Unknown Worker',
        timestamp: new Date(),
        isVoiceTransaction: false,
        status: 'completed'
      });

      // Clear form
      setSelectedProduct(null);
      setQuantity(1);
      setPayment(0);
      
      // Reload products to update stock
      await loadProducts();

      toast({
        title: "Sale Saved!",
        description: `Sale of ${quantity} ${selectedProduct.name}(s) recorded successfully`,
      });

    } catch (error) {
      console.error("Error saving sale:", error);
      toast({
        title: "Error",
        description: "Failed to save sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    setQuantity(1);
    setPayment(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2 charnoks-text">
          Quick Sale Recording
        </h2>
        <p className="text-gray-300">
          Select product → Enter quantity → Enter payment → Save
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and View Controls */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-white/30 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="bg-white/10 border-white/20 text-white"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="bg-white/10 border-white/20 text-white"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid/List */}
          <Card className="card-reference animation-resistant">
            <CardHeader className="pb-4">
              <CardTitle className="text-solid flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select Product ({filteredProducts.length} available)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No products available</p>
                </div>
              ) : (
                <div className={`grid gap-3 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all duration-200 border-2 ${
                        selectedProduct?.id === product.id
                          ? 'border-green-400 bg-green-500/20'
                          : 'border-white/20 hover:border-orange-300 hover:bg-white/5'
                      } ${viewMode === 'list' ? 'flex-row' : ''}`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <CardContent className={`p-3 ${
                        viewMode === 'list' ? 'flex items-center gap-4' : ''
                      }`}>
                        {/* Product Image */}
                        <div className={`${
                          viewMode === 'grid' ? 'mb-3' : 'flex-shrink-0'
                        }`}>
                          <div className={`${
                            viewMode === 'grid' ? 'aspect-square' : 'w-12 h-12'
                          } bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center overflow-hidden`}>
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Package className={`${
                                viewMode === 'grid' ? 'h-6 w-6' : 'h-5 w-5'
                              } text-orange-500`} />
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <h3 className={`font-medium text-white mb-1 ${
                            viewMode === 'grid' ? 'text-sm' : 'text-base'
                          }`}>
                            {product.name}
                          </h3>
                          <p className={`font-bold text-green-400 mb-1 ${
                            viewMode === 'grid' ? 'text-sm' : 'text-lg'
                          }`}>
                            ₱{product.price.toFixed(2)}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-500/20 text-blue-300"
                            >
                              {product.category}
                            </Badge>
                            <Badge
                              variant={product.stock > 10 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {product.stock} left
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sale Calculation Panel */}
        <div className="space-y-4">
          {selectedProduct ? (
            <Card className="bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-xl border-green-400/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Sale Calculation
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="absolute top-3 right-3 text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Product */}
                <div className="p-3 bg-black/20 rounded-lg">
                  <h4 className="text-white font-medium">{selectedProduct.name}</h4>
                  <p className="text-green-400 font-bold">₱{selectedProduct.price.toFixed(2)} each</p>
                  <p className="text-gray-300 text-sm">{selectedProduct.stock} in stock</p>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <Label className="text-white">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-black/20 border-white/30 text-white"
                  />
                </div>

                {/* Payment Input */}
                <div className="space-y-2">
                  <Label className="text-white">Customer Payment (₱)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={payment}
                    onChange={(e) => setPayment(parseFloat(e.target.value) || 0)}
                    className="bg-black/20 border-white/30 text-white"
                    placeholder="Enter amount paid"
                  />
                </div>

                {/* Calculation Summary */}
                <div className="space-y-3 p-3 bg-black/30 rounded-lg">
                  <div className="flex justify-between text-white">
                    <span>Subtotal:</span>
                    <span>₱{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Payment:</span>
                    <span>₱{payment.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between font-bold text-lg ${
                    calculateChange() >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <span>Change:</span>
                    <span>₱{calculateChange().toFixed(2)}</span>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveSale}
                  disabled={loading || payment < calculateTotal() || quantity > selectedProduct.stock}
                  className="w-full h-12 charnoks-gradient hover:opacity-90 text-white font-bold"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Sale
                    </>
                  )}
                </Button>

                {payment < calculateTotal() && payment > 0 && (
                  <p className="text-red-400 text-sm text-center">
                    Payment is insufficient
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="card-visible">
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">No Product Selected</h3>
                <p className="text-gray-400 text-sm">
                  Select a product from the list to start recording a sale
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};