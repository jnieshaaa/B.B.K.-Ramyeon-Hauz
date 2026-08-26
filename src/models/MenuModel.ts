export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'ramyeon' | 'toppings' | 'drinks' | 'silog' | 'combos';
  image: string;
  isPopular?: boolean;
}

export type CategoryId = 'all' | 'ramyeon' | 'toppings' | 'drinks' | 'silog' | 'combos';

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string; // Used to display matching food icons
}

export interface DIYSelection {
  ramyeon: Product | null;
  toppings: { product: Product; quantity: number }[];
  drink: Product | null;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  status: 'pending' | 'completed';
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  itemId: string;
  itemName: string;
  auditDate: string;
  physicalCount: number;
  recordedCount: number;
  discrepancy: number;
  auditedBy: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  category: string;
  lastAudited?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  date: string;          // YYYY-MM-DD
  displayedQty: number;  // Displayed/added stock today
  soldQty: number;       // Qty sold today
}
