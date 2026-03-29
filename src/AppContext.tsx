import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Category, Item, Client, Supplier, User, CompanyConfig, 
  Lead, CostEstimation, Quote, SalesOrder, Invoice, 
  InventoryTransaction, Payment, PurchaseOrder, GRN
} from "./types";

interface AppContextType {
  categories: Category[];
  items: Item[];
  clients: Client[];
  suppliers: Supplier[];
  users: User[];
  company: CompanyConfig;
  leads: Lead[];
  estimations: CostEstimation[];
  quotes: Quote[];
  salesOrders: SalesOrder[];
  invoices: Invoice[];
  inventory: InventoryTransaction[];
  payments: Payment[];
  purchaseOrders: PurchaseOrder[];
  grns: GRN[];
  currentUser: User | null;
  
  // Add/Update/Delete functions
  setCurrentUser: (user: User | null) => void;
  addCategory: (category: Category) => void;
  addItem: (item: Item) => void;
  addClient: (client: Client) => void;
  addSupplier: (supplier: Supplier) => void;
  addUser: (user: User) => void;
  updateCompany: (config: CompanyConfig) => void;
  addLead: (lead: Lead) => void;
  updateLeadStatus: (id: string, status: Lead["status"]) => void;
  addEstimation: (estimation: CostEstimation) => void;
  updateEstimation: (id: string, updates: Partial<CostEstimation>) => void;
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  addSalesOrder: (order: SalesOrder) => void;
  addInvoice: (invoice: Invoice) => void;
  addInventoryTransaction: (transaction: InventoryTransaction) => void;
  addPayment: (payment: Payment) => void;
  addPurchaseOrder: (po: PurchaseOrder) => void;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder["status"]) => void;
  addGRN: (grn: GRN) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  customLocations: Record<string, Record<string, string[]>>;
  addCustomLocation: (country: string, state: string, city: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [company, setCompany] = useState<CompanyConfig>({
    name: "TAGLIO.ERP",
    address: "123 Business St, Tech City",
    currency: "INR",
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [estimations, setEstimations] = useState<CostEstimation[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryTransaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customLocations, setCustomLocations] = useState<Record<string, Record<string, string[]>>>({});

  // Load from localStorage
  useEffect(() => {
    const data = localStorage.getItem("nexus_erp_data");
    if (data) {
      const parsed = JSON.parse(data);
      setCategories(parsed.categories || []);
      setItems(parsed.items || []);
      setClients(parsed.clients || []);
      setSuppliers(parsed.suppliers || []);
      setUsers(parsed.users || []);
      setCompany(parsed.company || { name: "TAGLIO.ERP", address: "123 Business St, Tech City", currency: "INR" });
      setLeads(parsed.leads || []);
      setEstimations(parsed.estimations || []);
      setQuotes(parsed.quotes || []);
      setSalesOrders(parsed.salesOrders || []);
      setInvoices(parsed.invoices || []);
      setInventory(parsed.inventory || []);
      setPayments(parsed.payments || []);
      setPurchaseOrders(parsed.purchaseOrders || []);
      setGrns(parsed.grns || []);
      setCustomLocations(parsed.customLocations || {});
      
      const loadedUsers = parsed.users || [];
      if (loadedUsers.length > 0) {
        setCurrentUser(loadedUsers[0]);
      } else {
        // Create default admin user
        const defaultAdmin: User = {
          id: "admin-1",
          name: "Admin User",
          email: "admin@taglio.erp",
          role: "admin",
          permissions: {
            crm: { view: true, create: true, edit: true, delete: true, export: true },
            sales: { view: true, create: true, edit: true, delete: true, export: true },
            purchases: { view: true, create: true, edit: true, delete: true, export: true },
            inventory: { view: true, create: true, edit: true, delete: true, export: true },
            billing: { view: true, create: true, edit: true, delete: true, export: true },
            masters: { view: true, create: true, edit: true, delete: true, export: true },
            reports: { view: true, create: true, edit: true, delete: true, export: true },
          }
        };
        setUsers([defaultAdmin]);
        setCurrentUser(defaultAdmin);
      }
    } else {
      // Create default admin user on first load
      const defaultAdmin: User = {
        id: "admin-1",
        name: "Admin User",
        email: "admin@taglio.erp",
        role: "admin",
        permissions: {
          crm: { view: true, create: true, edit: true, delete: true, export: true },
          sales: { view: true, create: true, edit: true, delete: true, export: true },
          purchases: { view: true, create: true, edit: true, delete: true, export: true },
          inventory: { view: true, create: true, edit: true, delete: true, export: true },
          billing: { view: true, create: true, edit: true, delete: true, export: true },
          masters: { view: true, create: true, edit: true, delete: true, export: true },
          reports: { view: true, create: true, edit: true, delete: true, export: true },
        }
      };
      setUsers([defaultAdmin]);
      setCurrentUser(defaultAdmin);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = {
      categories, items, clients, suppliers, users, company,
      leads, estimations, quotes, salesOrders, invoices, inventory, payments, purchaseOrders, grns,
      customLocations
    };
    localStorage.setItem("nexus_erp_data", JSON.stringify(data));
  }, [categories, items, clients, suppliers, users, company, leads, estimations, quotes, salesOrders, invoices, inventory, payments, purchaseOrders, grns, customLocations]);

  const addCategory = (cat: Category) => setCategories([...categories, cat]);
  const addItem = (item: Item) => setItems([...items, item]);
  const addClient = (client: Client) => setClients([...clients, client]);
  const addSupplier = (supplier: Supplier) => setSuppliers([...suppliers, supplier]);
  const addUser = (user: User) => setUsers([...users, user]);
  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      setCurrentUser({ ...currentUser, ...updates } as User);
    }
  };
  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };
  const updateCompany = (config: CompanyConfig) => setCompany(config);
  const addLead = (lead: Lead) => setLeads([...leads, lead]);
  const updateLeadStatus = (id: string, status: Lead["status"]) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  };
  const addEstimation = (est: CostEstimation) => setEstimations([...estimations, est]);
  const updateEstimation = (id: string, updates: Partial<CostEstimation>) => {
    setEstimations(estimations.map(e => e.id === id ? { ...e, ...updates } : e));
  };
  const addQuote = (q: Quote) => setQuotes([...quotes, q]);
  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setQuotes(quotes.map(q => q.id === id ? { ...q, ...updates } : q));
  };
  const addSalesOrder = (so: SalesOrder) => setSalesOrders([...salesOrders, so]);
  const addInvoice = (inv: Invoice) => setInvoices([...invoices, inv]);
  const addInventoryTransaction = (tx: InventoryTransaction) => {
    setInventory([...inventory, tx]);
    // Update stock
    setItems(items.map(i => {
      if (i.id === tx.itemId) {
        let change = 0;
        if (tx.type === "GRN" || tx.type === "Return" || tx.type === "Adjustment") {
          change = tx.quantity;
        } else if (tx.type === "Issue") {
          change = -tx.quantity;
        }
        return { ...i, stock: i.stock + change };
      }
      return i;
    }));
  };
  const addPayment = (p: Payment) => setPayments([...payments, p]);
  const addPurchaseOrder = (po: PurchaseOrder) => setPurchaseOrders([...purchaseOrders, po]);
  const updatePurchaseOrderStatus = (id: string, status: PurchaseOrder["status"]) => {
    setPurchaseOrders(purchaseOrders.map(po => po.id === id ? { ...po, status } : po));
  };
  const addGRN = (grn: GRN) => {
    setGrns([...grns, grn]);
    // Also update inventory for accepted items
    grn.items.forEach(item => {
      if (item.acceptedQuantity > 0) {
        addInventoryTransaction({
          id: Math.random().toString(36).substr(2, 9),
          type: "GRN",
          itemId: item.itemId,
          quantity: item.acceptedQuantity,
          referenceId: grn.id,
          date: grn.date,
          notes: `GRN for PO #${grn.poId}`
        });
      }
    });
  };

  const addCustomLocation = (country: string, state: string, city: string) => {
    setCustomLocations(prev => {
      const next = { ...prev };
      if (!next[country]) next[country] = {};
      if (!next[country][state]) next[country][state] = [];
      if (!next[country][state].includes(city)) {
        next[country][state] = [...next[country][state], city];
      }
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      categories, items, clients, suppliers, users, company, leads, estimations, quotes, salesOrders, invoices, inventory, payments, purchaseOrders, grns, currentUser, customLocations,
      setCurrentUser, addCategory, addItem, addClient, addSupplier, addUser, updateUser, deleteUser, updateCompany, addLead, updateLeadStatus, addEstimation, updateEstimation, addQuote, updateQuote, addSalesOrder, addInvoice, addInventoryTransaction, addPayment, addPurchaseOrder, updatePurchaseOrderStatus, addGRN, addCustomLocation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
