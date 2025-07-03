import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OfflineState } from "@/lib/offlineState";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { Product, CartItem } from "@/types/product";
import { voiceRecognition } from "@/lib/voiceRecognition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { QuickSaleModal } from "./QuickSaleModal";
import { VoiceInputModal } from "./VoiceInputModal";
import {
  Search,
  Mic,
  ShoppingCart,
  Package,
  Zap,
  Grid3X3,
  List,
} from "lucide-react";

export const WorkerSalesInterface = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal states
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]);
  const [selectedAmountPaid, setSelectedAmountPaid] = useState(0);
  const [voiceInput, setVoiceInput] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery]);

  const fetchProducts = async () => {
    if (!user || !user.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "products"));
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        isActive: doc.data().isActive !== false, // Default to true if not specified
      })) as Product[];

      const activeProducts = productsData.filter((p) => p.isActive);
      setProducts(activeProducts);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      // Show empty products list on error
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredProducts(filtered);
  };

  const handleProductTap = (product: Product) => {
    const cartItem: CartItem = {
      product,
      quantity: 1,
      subtotal: product.price,
    };

    setSelectedCartItems([cartItem]);
    setSelectedAmountPaid(0);
    setVoiceInput("");
    setIsQuickSaleOpen(true);
  };

  const handleVoiceInput = () => {
    if (!voiceRecognition.isVoiceSupported()) {
      toast({
        title: "Voice Not Supported",
        description:
          "Voice recognition is not supported in your browser. Please use Chrome, Safari, or Edge.",
        variant: "destructive",
      });
      return;
    }

    setIsVoiceModalOpen(true);
  };

  const handleVoiceTransactionParsed = (
    cartItems: CartItem[],
    amountPaid: number,
    voiceInputText: string,
  ) => {
    setSelectedCartItems(cartItems);
    setSelectedAmountPaid(amountPaid);
    setVoiceInput(voiceInputText);
    setIsQuickSaleOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header with Search and Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3X3 className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={handleVoiceInput}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!voiceRecognition.isVoiceSupported()}
            >
              <Mic className="h-4 w-4 mr-2" />
              Voice Sale
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            {filteredProducts.length} products
          </div>
          {!voiceRecognition.isVoiceSupported() && (
            <Badge variant="secondary" className="text-xs">
              Voice input not supported
            </Badge>
          )}
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Try adjusting your search terms"
              : "No products available"}
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              : "grid-cols-1"
          }`}
        >
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-orange-300 ${
                viewMode === "grid" ? "" : "flex-row"
              }`}
              onClick={() => handleProductTap(product)}
            >
              <CardContent
                className={`p-3 ${viewMode === "list" ? "flex items-center gap-4" : ""}`}
              >
                {/* Product Image */}
                <div
                  className={`${viewMode === "grid" ? "mb-3" : "flex-shrink-0"}`}
                >
                  <div
                    className={`${
                      viewMode === "grid" ? "aspect-square" : "w-16 h-16"
                    } bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center overflow-hidden`}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Package
                        className={`${
                          viewMode === "grid" ? "h-8 w-8" : "h-6 w-6"
                        } text-orange-500`}
                      />
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className={`${viewMode === "list" ? "flex-1" : ""}`}>
                  <h3
                    className={`font-medium text-gray-900 mb-1 ${
                      viewMode === "grid" ? "text-sm" : "text-base"
                    }`}
                  >
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-bold text-green-600 ${
                          viewMode === "grid" ? "text-sm" : "text-lg"
                        }`}
                      >
                        ₱{product.price.toFixed(2)}
                      </p>
                      {viewMode === "list" && (
                        <p className="text-xs text-gray-500">
                          {product.category}
                        </p>
                      )}
                    </div>

                    {product.stock < 10 && (
                      <Badge variant="destructive" className="text-xs">
                        Low Stock
                      </Badge>
                    )}
                  </div>

                  {viewMode === "grid" && (
                    <p className="text-xs text-gray-500 mt-1">
                      {product.category}
                    </p>
                  )}
                </div>

                {/* Quick Sale Button for List View */}
                {viewMode === "list" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductTap(product);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Quick Sale
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <QuickSaleModal
        isOpen={isQuickSaleOpen}
        onClose={() => setIsQuickSaleOpen(false)}
        initialItems={selectedCartItems}
        initialAmountPaid={selectedAmountPaid}
        isVoiceTransaction={!!voiceInput}
        voiceInput={voiceInput}
      />

      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        products={products}
        onTransactionParsed={handleVoiceTransactionParsed}
      />
    </div>
  );
};
