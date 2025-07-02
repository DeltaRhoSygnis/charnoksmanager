
export interface SaleItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  timestamp: Date;
}
