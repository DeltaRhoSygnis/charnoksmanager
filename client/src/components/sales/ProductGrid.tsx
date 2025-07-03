import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { OfflineState } from "@/lib/offlineState";
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Search, Package, Mic, MicOff } from "lucide-react";
import { voiceRecognition } from "@/lib/voiceRecognition";

interface ProductGridProps {
  onAddToCart: (product: Product, quantity: number) => void;
  onVoiceTransaction?: (voiceData: any) => void;
}

export const ProductGrid = ({ onAddToCart, onVoiceTransaction }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      if (OfflineState.hasFirebaseAccess()) {
        const snapshot = await getDocs(collection(db, "products"));
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsData.filter((p) => p.stock > 0));
      } else {
        const localProducts = LocalStorageDB.getProducts();
        setProducts(localProducts.filter((p) => p.stock > 0));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      const localProducts = LocalStorageDB.getProducts();
      setProducts(localProducts.filter((p) => p.stock > 0));
      toast({
        title: "Using Local Data",
        description: "Products loaded from local storage",
      });
    }
    setIsLoading(false);
  };

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    if (selectedProduct && quantity > 0) {
      onAddToCart(selectedProduct, quantity);
      setIsModalOpen(false);
      setSelectedProduct(null);
      setQuantity(1);
      toast({
        title: "Added to Cart",
        description: `${quantity} ${selectedProduct.name} added to cart`,
      });
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceRecognition.isVoiceSupported()) {
      toast({
        title: "Voice Not Supported",
        description: "Voice recognition is not available in this browser",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      voiceRecognition.stopListening();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const voiceText = await voiceRecognition.startListening();
      
      const voiceData = voiceRecognition.parseVoiceInput(voiceText);
      const matchedProducts = voiceRecognition.matchProductsWithDatabase(
        voiceData.products,
        products
      );

      if (matchedProducts.length > 0) {
        onVoiceTransaction?.({
          ...voiceData,
          matchedProducts,
        });
        toast({
          title: "Voice Command Processed",
          description: `Recognized: "${voiceText}"`,
        });
      } else {
        toast({
          title: "No Products Found",
          description: "Could not match any products from your voice input",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Voice recognition error:", error);
      toast({
        title: "Voice Recognition Error",
        description: "Please try again or use manual input",
        variant: "destructive",
      });
    } finally {
      setIsListening(false);
    }
  };

  const getProductImage = (product: Product) => {
    if (product.imageUrl) {
      return product.imageUrl;
    }
    // Default placeholder image based on category
    const categoryImages: { [key: string]: string } = {
      "fried chicken": "🍗",
      "beverages": "🥤",
      "snacks": "🍿",
      "desserts": "🍰",
      "rice": "🍚",
      "sides": "🍟",
    };
    
    const emoji = categoryImages[product.category.toLowerCase()] || "📦";
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50%" x="50%" text-anchor="middle" dy="0.35em" font-size="60">${emoji}</text></svg>`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Voice Input */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 rounded-xl"
          />
        </div>
        <Button
          onClick={handleVoiceInput}
          className={`h-12 px-6 rounded-xl transition-all duration-300 ${
            isListening 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "charnoks-gradient hover:opacity-90"
          }`}
        >
          {isListening ? (
            <MicOff className="h-5 w-5 mr-2" />
          ) : (
            <Mic className="h-5 w-5 mr-2" />
          )}
          {isListening ? "Stop" : "Voice"}
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="bg-black/40 backdrop-blur-lg border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl"
            onClick={() => handleProductClick(product)}
          >
            <CardContent className="p-4">
              <div className="aspect-square mb-3 bg-white/5 rounded-lg overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                <p className="text-xs text-gray-300">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-bold text-lg">₱{product.price.toFixed(2)}</span>
                  <Badge 
                    className={`text-xs ${
                      product.stock > 10 
                        ? "bg-green-600" 
                        : product.stock > 5 
                        ? "bg-yellow-600" 
                        : "bg-red-600"
                    }`}
                  >
                    {product.stock} left
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-24 w-24 text-gray-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
          <p className="text-gray-400">
            {searchTerm ? "Try adjusting your search terms" : "No products available for sale"}
          </p>
        </div>
      )}

      {/* Product Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-xl border-white/20 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Add to Cart
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden">
                  <img
                    src={getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{selectedProduct.name}</h3>
                  <p className="text-gray-300">{selectedProduct.category}</p>
                  <p className="text-green-400 font-bold text-xl">₱{selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white font-semibold mb-2 block">Quantity</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-10 w-10 border-white/30 hover:bg-white/10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-center bg-white/10 border-white/30 text-white w-20 h-10"
                      min="1"
                      max={selectedProduct.stock}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      className="h-10 w-10 border-white/30 hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Available: {selectedProduct.stock} items
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Subtotal:</span>
                    <span className="text-green-400 font-bold text-xl">
                      ₱{(selectedProduct.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 charnoks-gradient hover:opacity-90 text-white font-bold"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};