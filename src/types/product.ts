export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  amountPaid: number;
  change: number;
  paymentMethod: "cash" | "card" | "digital";
  workerId: string;
  workerEmail: string;
  timestamp: Date;
  isVoiceTransaction: boolean;
  voiceInput?: string;
  status: "completed" | "pending" | "cancelled";
}

export interface VoiceTransactionInput {
  products: Array<{
    name: string;
    quantity: number;
  }>;
  amountPaid: number;
  rawText: string;
}
