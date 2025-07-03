import { useState, useEffect } from "react";
import { voiceRecognition } from "@/lib/voiceRecognition";
import { Product, CartItem } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onTransactionParsed: (
    cartItems: CartItem[],
    amountPaid: number,
    voiceInput: string,
  ) => void;
}

export const VoiceInputModal = ({
  isOpen,
  onClose,
  products,
  onTransactionParsed,
}: VoiceInputModalProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [parsedProducts, setParsedProducts] = useState<any[]>([]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setIsListening(false);
    setTranscribedText("");
    setParsedProducts([]);
    setAmountPaid(0);
    setIsProcessing(false);
    setError("");
  };

  const startListening = async () => {
    if (!voiceRecognition.isVoiceSupported()) {
      setError("Voice recognition is not supported in your browser");
      return;
    }

    setIsListening(true);
    setError("");
    setTranscribedText("");

    try {
      const result = await voiceRecognition.startListening();
      setTranscribedText(result);
      parseVoiceInput(result);
    } catch (error: any) {
      setError(error.message || "Voice recognition failed");
      console.error("Voice recognition error:", error);
    } finally {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    voiceRecognition.stopListening();
    setIsListening(false);
  };

  const parseVoiceInput = async (text: string) => {
    setIsProcessing(true);
    try {
      const parsed = voiceRecognition.parseVoiceInput(text);
      const matchedProducts = voiceRecognition.matchProductsWithDatabase(
        parsed.products,
        products,
      );

      setParsedProducts(matchedProducts);
      setAmountPaid(parsed.amountPaid);

      if (matchedProducts.length === 0) {
        setError("No products were recognized from your voice input");
      } else {
        const hasUnmatched = matchedProducts.some((p) => !p.matched);
        if (hasUnmatched) {
          toast({
            title: "Some products not found",
            description:
              "Some products mentioned could not be matched with our inventory",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      setError("Failed to parse voice input");
      console.error("Parsing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmTransaction = () => {
    const validProducts = parsedProducts.filter((p) => p.matched);

    if (validProducts.length === 0) {
      toast({
        title: "No valid products",
        description:
          "Please ensure your voice input includes valid product names",
        variant: "destructive",
      });
      return;
    }

    const cartItems: CartItem[] = validProducts.map((p) => ({
      product: {
        id: p.id,
        name: p.name,
        price: p.price,
        stock: 100, // Assuming stock for quick sale
        category: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      quantity: p.quantity,
      subtotal: p.total,
    }));

    onTransactionParsed(cartItems, amountPaid, transcribedText);
    onClose();
  };

  const totalAmount = parsedProducts
    .filter((p) => p.matched)
    .reduce((sum, p) => sum + p.total, 0);

  const change = amountPaid - totalAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Input Sale
          </DialogTitle>
          <DialogDescription>
            Speak your order clearly. Example: "2 Coke and 1 Piattos, 100 pesos"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Voice Recognition Status */}
          {!voiceRecognition.isVoiceSupported() ? (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Voice recognition is not supported in your browser. Please use
                Chrome, Safari, or Edge.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center space-y-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`w-full h-16 text-lg ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-6 w-6 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="h-6 w-6 mr-2" />
                    Start Voice Input
                  </>
                )}
              </Button>

              {isListening && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Volume2 className="h-4 w-4" />
                  Listening... Speak now
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Transcribed Text */}
          {transcribedText && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Volume2 className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      You said:
                    </p>
                    <p className="text-sm text-blue-700">"{transcribedText}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-600">
                Processing voice input...
              </span>
            </div>
          )}

          {/* Parsed Products */}
          {parsedProducts.length > 0 && !isProcessing && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">
                Parsed Items
              </h3>
              {parsedProducts.map((product, index) => (
                <Card
                  key={index}
                  className={`border ${
                    product.matched
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {product.matched ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">
                            Quantity: {product.quantity}
                            {product.matched &&
                              ` × ₱${product.price.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                      {product.matched && (
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            ₱{product.total.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Transaction Summary */}
              {parsedProducts.some((p) => p.matched) && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">
                        ₱{totalAmount.toFixed(2)}
                      </span>
                    </div>
                    {amountPaid > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Amount Paid:</span>
                          <span>₱{amountPaid.toFixed(2)}</span>
                        </div>
                        <div
                          className={`flex justify-between font-bold ${
                            change >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          <span>Change:</span>
                          <span>₱{change.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {parsedProducts.some((p) => p.matched) && (
              <Button
                onClick={handleConfirmTransaction}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!amountPaid || change < 0}
              >
                Continue to Checkout
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
