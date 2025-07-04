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
  type: "sale" | "expense";
  items?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount?: number;
  amount?: number;
  amountPaid?: number;
  change?: number;
  paymentMethod?: "cash" | "card" | "digital";
  workerId: string;
  workerEmail: string;
  timestamp: Date;
  isVoiceTransaction?: boolean;
  voiceInput?: string;
  status: "completed" | "pending" | "cancelled";
  description?: string;
  category?: string;
}

export interface VoiceTransactionInput {
  products: Array<{
    name: string;
    quantity: number;
  }>;
  amountPaid: number;
  rawText: string;
}
