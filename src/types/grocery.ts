export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  checked: boolean;
  category?: string;
}

export interface BillCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
}

export interface Budget {
  limit: number;
  spent: number;
  accumulated: number; // Past transactions total
}

export interface Transaction {
  id: string;
  date: string;
  items: GroceryItem[];
  calculation: BillCalculation;
  bookmarked?: boolean;
}
