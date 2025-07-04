import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { OfflineState } from "@/lib/offlineState";
import { Product, CartItem, Transaction } from "@/types/product";
import { ProductGrid } from "./ProductGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Calculator, 
  CreditCard, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle,
  Receipt,
  DollarSign
} from "lucide-react";

export const EnhancedSalesInterface = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  const addToCart = (product: Product, quantity: number) => {
    const existingItemIndex = cartItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} items available`,
          variant: "destructive",
        });
        return;
      }

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        subtotal: product.price * newQuantity,
      };
      setCartItems(updatedItems);
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        subtotal: product.price * quantity,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const updatedItems = [...cartItems];
    const item = updatedItems[index];
    
    if (newQuantity > item.product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${item.product.stock} items available`,
        variant: "destructive",
      });
      return;
    }

    updatedItems[index] = {
      ...item,
      quantity: newQuantity,
      subtotal: item.product.price * newQuantity,
    };
    setCartItems(updatedItems);
  };

  const removeFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
    setAmountPaid(0);
    setShowPaymentSection(false);
  };

  const handleVoiceTransaction = (voiceData: any) => {
    const { matchedProducts, amountPaid: voiceAmountPaid } = voiceData;
    
    // Clear existing cart
    setCartItems([]);
    
    // Add matched products to cart
    const newCartItems: CartItem[] = [];
    matchedProducts.forEach((item: any) => {
      if (item.matched) {
        const cartItem: CartItem = {
          product: {
            id: item.id,
            name: item.name,
            price: item.price,
            stock: 100, // We'll need to fetch actual stock
            category: "Voice Input",
            imageUrl: "",
            description: "",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          quantity: item.quantity,
          subtotal: item.total,
        };
        newCartItems.push(cartItem);
      }
    });
    
    setCartItems(newCartItems);
    setAmountPaid(voiceAmountPaid);
    setShowPaymentSection(true);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const change = amountPaid - totalAmount;
  const canProcessSale = cartItems.length > 0 && amountPaid >= totalAmount;

  const processSale = async () => {
    if (!user || !canProcessSale) {
      toast({
        title: "Invalid Transaction",
        description: "Please check your cart and payment amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const transactionData: Omit<Transaction, "id"> = {
        type: "sale",
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          total: item.subtotal,
        })),
        totalAmount,
        amountPaid,
        change,
        paymentMethod: "cash",
        workerId: user.uid,
        workerEmail: user.email,
        timestamp: new Date(),
        isVoiceTransaction: false,
        status: "completed",
      };

      if (OfflineState.hasFirebaseAccess()) {
        await addDoc(collection(db, "sales"), transactionData);
        
        // Update product stock
        for (const item of cartItems) {
          await updateDoc(doc(db, "products", item.product.id), {
            stock: increment(-item.quantity),
          });
        }
      } else {
        LocalStorageDB.addTransaction({
          ...transactionData,
          id: Date.now().toString(),
        } as Transaction);
      }

      toast({
        title: "Sale Completed! 🎉",
        description: `Total: ₱${totalAmount.toFixed(2)} | Change: ₱${change.toFixed(2)}`,
      });

      clearCart();
    } catch (error) {
      console.error("Error processing sale:", error);
      toast({
        title: "Error Processing Sale",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestPaymentAmounts = () => {
    const roundedAmount = Math.ceil(totalAmount / 10) * 10;
    const suggestions = [
      totalAmount,
      roundedAmount,
      roundedAmount + 10,
      roundedAmount + 20,
      roundedAmount + 50,
    ];
    return Array.from(new Set(suggestions)).slice(0, 4);
  };

  return (
    <div className="min-h-screen galaxy-animated cosmic-overlay">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Product Grid Section */}
          <div className="lg:col-span-2">
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-orange-400" />
                  Select Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductGrid 
                  onAddToCart={addToCart} 
                  onVoiceTransaction={handleVoiceTransaction}
                />
              </CardContent>
            </Card>
          </div>

          {/* Cart and Payment Section */}
          <div className="space-y-6">
            
            {/* Cart Summary */}
            <Card className="bg-black/40 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-400" />
                    Cart ({cartItems.length})
                  </span>
                  {cartItems.length > 0 && (
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Select products to start a sale
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-sm">{item.product.name}</h4>
                          <p className="text-xs text-gray-400">₱{item.product.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                            className="h-8 w-8 p-0 border-white/30"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-white font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                            className="h-8 w-8 p-0 border-white/30"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-sm">
                            ₱{item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <Separator className="bg-white/20" />
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        Total: ₱{totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            {cartItems.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">
                      Amount Paid (₱)
                    </Label>
                    <Input
                      type="number"
                      value={amountPaid || ""}
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      placeholder="Enter amount paid"
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 h-12 text-xl font-bold"
                    />
                  </div>

                  {/* Quick Payment Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {suggestPaymentAmounts().map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setAmountPaid(amount)}
                        className="border-white/30 text-white hover:bg-white/10 h-10"
                      >
                        ₱{amount.toFixed(0)}
                      </Button>
                    ))}
                  </div>

                  {/* Change Display */}
                  {amountPaid > 0 && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Change:</span>
                        <span className={`text-xl font-bold ${
                          change >= 0 ? "text-green-400" : "text-red-400"
                        }`}>
                          ₱{Math.abs(change).toFixed(2)}
                        </span>
                      </div>
                      {change < 0 && (
                        <p className="text-red-400 text-sm mt-2">
                          Insufficient payment
                        </p>
                      )}
                    </div>
                  )}

                  {/* Process Sale Button */}
                  <Button
                    onClick={processSale}
                    disabled={!canProcessSale || isProcessing}
                    className={`w-full h-14 text-lg font-bold transition-all duration-300 ${
                      canProcessSale
                        ? "charnoks-gradient hover:opacity-90 text-white"
                        : "bg-gray-600 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Complete Sale
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};