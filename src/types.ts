export type ItemType = "raw material" | "finish goods" | "Consumables" | "Tools";

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  itemCode: string;
  name: string;
  type: ItemType;
  categoryId: string;
  uom: string;
  purchaseRate: number;
  sellingRate: number;
  gstPercentage: number;
  image?: string;
  stock: number;
  alertRequired?: boolean;
  reorderThreshold?: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  street: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gstApplicable: boolean;
  gstNumber?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  street: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gstApplicable: boolean;
  gstNumber?: string;
}

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  secure: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  permissions?: Record<string, ModulePermissions>;
  smtpConfig?: SmtpConfig;
}

export interface CompanyConfig {
  name: string;
  address: string;
  logo?: string;
  gstNumber?: string;
  currency: string;
}

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: LeadStatus;
  value: number;
  createdAt: string;
  notes: string[];
}

export interface TransactionItem {
  itemId: string;
  quantity: number;
  rate: number;
  gstPercentage: number;
  amount: number;
  gstAmount: number;
  total: number;
  tolerancePercentage?: number;
  expectedDeliveryDate?: string;
}

export interface CostEstimation {
  id: string;
  clientId: string;
  items: TransactionItem[];
  subtotal: number;
  totalGst: number;
  totalAmount: number;
  createdAt: string;
  status?: "Draft" | "Quoted";
}

export interface Quote extends CostEstimation {
  validUntil: string;
  estimationId?: string;
}

export interface SalesOrder extends Omit<CostEstimation, "status"> {
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
}

export interface Invoice extends Omit<CostEstimation, "status"> {
  orderId?: string;
  status: "Unpaid" | "Partially Paid" | "Paid" | "Overdue";
  dueDate: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: TransactionItem[];
  subtotal: number;
  totalGst: number;
  totalAmount: number;
  status: "Draft" | "Sent" | "Partially Received" | "Received" | "Cancelled";
  date: string;
  expectedDeliveryDate?: string;
}

export interface GRNItem {
  itemId: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
}

export interface GRN {
  id: string;
  poId: string;
  date: string;
  items: GRNItem[];
  status: "Draft" | "Completed";
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  type: "PO" | "GRN" | "Issue" | "Return" | "Adjustment" | "Transfer";
  itemId: string;
  quantity: number;
  referenceId?: string;
  date: string;
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: "Cash" | "Bank Transfer" | "Cheque" | "Online";
}
