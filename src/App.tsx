/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./AppContext";
import { Layout } from "./Layout";
import { Dashboard } from "./pages/Dashboard";
import { Reports } from "./pages/Reports";
import { PurchasesPage } from "./pages/Purchases";
import { LeadsPage } from "./pages/Leads";
import { ClientsMaster, ItemsMaster, CategoriesMaster } from "./pages/Masters";
import { UsersMaster } from "./pages/Users";
import { SuppliersMaster } from "./pages/Suppliers";
import { TransactionForm, TransactionList } from "./pages/Sales";
import { InventoryPage } from "./pages/Inventory";
import { GRNPage } from "./pages/GRN";
import { MaterialIssuePage } from "./pages/MaterialIssue";
import { MaterialReturnPage } from "./pages/MaterialReturn";
import { StockAdjustmentPage } from "./pages/StockAdjustment";
import { StockTransferPage } from "./pages/StockTransfer";
import { BillingPage } from "./pages/Billing";
import { CompanyConfigPage } from "./pages/CompanyConfig";
import { useApp } from "./AppContext";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SalesWrapper = ({ type }: { type: "estimation" | "quote" | "order" }) => {
  const [isNew, setIsNew] = useState(false);
  const { estimations, quotes, salesOrders } = useApp();
  
  const data = type === "estimation" ? estimations : type === "quote" ? quotes : salesOrders;

  return (
    <AnimatePresence mode="wait">
      {isNew ? (
        <TransactionForm 
          key="form"
          type={type} 
          onSave={() => setIsNew(false)} 
          onCancel={() => setIsNew(false)} 
        />
      ) : (
        <TransactionList 
          key="list"
          type={type} 
          data={data} 
          onNew={() => setIsNew(true)} 
        />
      )}
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/estimation" element={<SalesWrapper type="estimation" />} />
            <Route path="/quotes" element={<SalesWrapper type="quote" />} />
            <Route path="/orders" element={<SalesWrapper type="order" />} />
            <Route path="/inventory/purchases" element={<PurchasesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/grn" element={<GRNPage />} />
            <Route path="/inventory/issue" element={<MaterialIssuePage />} />
            <Route path="/inventory/return" element={<MaterialReturnPage />} />
            <Route path="/inventory/adjustment" element={<StockAdjustmentPage />} />
            <Route path="/inventory/transfer" element={<StockTransferPage />} />
            <Route path="/invoices" element={<BillingPage />} />
            <Route path="/payments" element={<BillingPage />} />
            <Route path="/reports" element={<Reports />} />
            
            {/* Masters */}
            <Route path="/masters/clients" element={<ClientsMaster />} />
            <Route path="/masters/items" element={<ItemsMaster />} />
            <Route path="/masters/categories" element={<CategoriesMaster />} />
            <Route path="/masters/users" element={<UsersMaster />} />
            <Route path="/masters/suppliers" element={<SuppliersMaster />} />
            <Route path="/masters/company" element={<CompanyConfigPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

