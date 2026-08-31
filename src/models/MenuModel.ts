export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  isPopular?: boolean;
}

export type CategoryId = string;

export interface Category {
  id: string;
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

export interface ContactInfo {
  phone: string;
  email: string;
  messengerName: string;
  messengerLink: string;
  address: string;
  landmarkNear: string;
  landmarkFront: string;
}
