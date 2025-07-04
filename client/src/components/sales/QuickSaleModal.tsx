import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LocalStorageDB } from "@/lib/localStorageDB";
import { OfflineState } from "@/lib/offlineState";
import { Product, CartItem, Transaction } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Minus, Plus, Calculator, DollarSign } from "lucide-react";

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItems?: CartItem[];
  initialAmountPaid?: number;
  isVoiceTransaction?: boolean;
  voiceInput?: string;
}

export const QuickSaleModal = ({
  isOpen,
  onClose,
  initialItems = [],
  initialAmountPaid = 0,
  isVoiceTransaction = false,
  voiceInput = "",
}: QuickSaleModalProps) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialItems);
  const [amountPaid, setAmountPaid] = useState(initialAmountPaid);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCartItems(initialItems);
      setAmountPaid(initialAmountPaid);
    }
  }, [isOpen, initialItems, initialAmountPaid]);

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setCartItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            quantity: newQuantity,
            subtotal: item.product.price * newQuantity,
          };
        }
        return item;
      }),
    );
  };

  const removeItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const change = amountPaid - totalAmount;
  const isValidTransaction = cartItems.length > 0 && amountPaid >= totalAmount;

  const handleSubmit = async () => {
    if (!user || !isValidTransaction) return;

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
        isVoiceTransaction,
        voiceInput: isVoiceTransaction ? voiceInput : undefined,
        status: "completed",
      };

      // Try Firebase first, fallback to local storage
      try {
        if (OfflineState.hasFirebaseAccess()) {
          await addDoc(collection(db, "sales"), transactionData);
        } else {
          LocalStorageDB.addTransaction(transactionData);
        }
      } catch (firebaseError: any) {
        if (OfflineState.isNetworkError(firebaseError)) {
          // Fallback to local storage
          LocalStorageDB.addTransaction(transactionData);
        } else {
          throw firebaseError;
        }
      }

      toast({
        title: "Sale Recorded!",
        description: `Transaction completed. Change: ₱${change.toFixed(2)}`,
      });

      onClose();
    } catch (error) {
      console.error("Error recording sale:", error);
      toast({
        title: "Error",
        description: "Failed to record sale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmountButtons = [50, 100, 200, 500, 1000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Quick Sale
            {isVoiceTransaction && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Voice
              </Badge>
            )}
          </DialogTitle>
          {isVoiceTransaction && voiceInput && (
            <DialogDescription className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
              Voice input: "{voiceInput}"
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Cart Items */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Items</h3>
            {cartItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No items selected
              </div>
            ) : (
              cartItems.map((item, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          ₱{item.product.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateQuantity(index, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            updateQuantity(index, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-medium text-sm">
                          ₱{item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Separator />

          {/* Payment Section */}
          <div className="space-y-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>₱{totalAmount.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                min="0"
                value={amountPaid || ""}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount paid"
                className="text-lg"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-5 gap-2">
              {quickAmountButtons.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmountPaid(amount)}
                  className="text-xs"
                >
                  ₱{amount}
                </Button>
              ))}
            </div>

            {/* Change Display */}
            {amountPaid > 0 && (
              <div
                className={`p-3 rounded-lg border-2 ${
                  change >= 0
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Change:</span>
                  <span className="text-xl font-bold">
                    ₱{change.toFixed(2)}
                  </span>
                </div>
                {change < 0 && (
                  <p className="text-sm mt-1">Insufficient payment</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValidTransaction || isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Complete Sale"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
