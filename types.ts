
export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

// Added sku and createdAt to support db.ts seeding
export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  brand: string;
  costPrice: number;
  salePrice: number;
  stockQty: number;
  minStockAlert: number;
  updatedAt?: number;
  sku?: string;
  createdAt?: number;
}

// Added discount to support POS and Repair usage
export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  costPrice: number;
  total: number;
  discount?: number;
}

// Added totalDiscount and tax to support POS finalization
export interface Sale {
  id: string;
  invoiceNo: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subTotal: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card';
  createdAt: number;
  userId: string;
  totalDiscount?: number;
  tax?: number;
}

export enum RepairStatus {
  RECEIVED = 'تم الاستلام',
  COMPLETED = 'جاهز للتسليم',
  DELIVERED = 'تم التسليم للعميل',
  CANCELED = 'مرتجع بدون إصلاح'
}

// Added missing fields used in Repair view
export interface RepairTicket {
  id: string;
  ticketNo: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  status: RepairStatus;
  totalCost: number;
  deposit: number;
  receivedDate: number;
  deviceType?: string;
  imei?: string;
  issueDescription?: string;
  technician?: string;
  partsUsed?: SaleItem[];
  laborCost?: number;
  expectedDelivery?: number;
}

// Added Purchase interface to fix import errors in Purchases view
export interface Purchase {
  id: string;
  invoiceNo: string;
  supplier: string;
  phone?: string;
  items: any[];
  grandTotal: number;
  createdAt: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  notes?: string;
  createdAt: number;
  addedBy?: string;
}

// Added categories, brands, and suppliers to match INITIAL_STATE in db.ts
export interface AppState {
  products: Product[];
  sales: Sale[];
  repairs: RepairTicket[];
  expenses: Expense[];
  purchases: Purchase[];
  currentUser: User | null;
  isOffline: boolean;
  categories?: string[];
  brands?: string[];
  suppliers?: string[];
}
