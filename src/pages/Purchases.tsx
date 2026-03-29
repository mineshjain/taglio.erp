import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { 
  Plus, Search, FileText, ShoppingCart, 
  Package, CheckCircle2, Clock, X, Trash2, Edit2, ArrowLeft, Image as ImageIcon,
  Calendar, Info, ChevronRight, AlertCircle, Minus
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { PurchaseOrder, TransactionItem } from "@/types";
import { motion, AnimatePresence } from "motion/react";

export const PurchasesPage: React.FC = () => {
  const { purchaseOrders, suppliers, items, categories, addPurchaseOrder } = useApp();
  const [view, setView] = useState<"list" | "form">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // PO Form State
  const [poFormData, setPoFormData] = useState<Partial<PurchaseOrder>>({
    supplierId: "",
    items: [],
    status: "Draft",
    date: new Date().toISOString().split("T")[0],
  });

  const selectedSupplier = suppliers.find(s => s.id === poFormData.supplierId);

  // Recalculate GST when supplier changes
  useEffect(() => {
    if (poFormData.items && poFormData.items.length > 0) {
      setPoFormData(prev => ({
        ...prev,
        items: prev.items?.map(item => {
          const amount = item.quantity * item.rate;
          const gstAmount = selectedSupplier?.gstApplicable ? (amount * item.gstPercentage) / 100 : 0;
          return {
            ...item,
            amount,
            gstAmount,
            total: amount + gstAmount
          };
        })
      }));
    }
  }, [poFormData.supplierId, selectedSupplier?.gstApplicable]);

  const handleCreatePO = () => {
    const subtotal = poFormData.items?.reduce((acc, item) => acc + item.amount, 0) || 0;
    const totalGst = poFormData.items?.reduce((acc, item) => acc + item.gstAmount, 0) || 0;
    
    addPurchaseOrder({
      id: Math.random().toString(36).substr(2, 9),
      supplierId: poFormData.supplierId!,
      items: poFormData.items || [],
      subtotal,
      totalGst,
      totalAmount: subtotal + totalGst,
      status: "Sent",
      date: poFormData.date || new Date().toISOString(),
    });
    
    setView("list");
    setPoFormData({ supplierId: "", items: [], status: "Draft", date: new Date().toISOString().split("T")[0] });
  };

  const handleAddItemToPO = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setPoFormData(prev => {
      const existingItems = prev.items || [];
      const existingIndex = existingItems.findIndex(li => li.itemId === itemId);
      
      if (existingIndex >= 0) {
        const newItems = [...existingItems];
        const qty = newItems[existingIndex].quantity + 1;
        const amount = qty * newItems[existingIndex].rate;
        const gstAmount = selectedSupplier?.gstApplicable ? amount * (newItems[existingIndex].gstPercentage / 100) : 0;
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: qty,
          amount,
          gstAmount,
          total: amount + gstAmount
        };
        return { ...prev, items: newItems };
      }

      const amount = item.purchaseRate;
      const gstAmount = selectedSupplier?.gstApplicable ? amount * (item.gstPercentage / 100) : 0;
      const newItem: TransactionItem = {
        itemId,
        quantity: 1,
        rate: item.purchaseRate,
        gstPercentage: item.gstPercentage,
        amount: amount,
        gstAmount: gstAmount,
        total: amount + gstAmount,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // Default 7 days
      };

      return {
        ...prev,
        items: [...existingItems, newItem]
      };
    });
  };

  const handleDecrementItemFromPO = (itemId: string) => {
    setPoFormData(prev => {
      const existingItems = prev.items || [];
      const existingIndex = existingItems.findIndex(li => li.itemId === itemId);
      
      if (existingIndex >= 0) {
        const item = existingItems[existingIndex];
        if (item.quantity > 1) {
          const newItems = [...existingItems];
          const qty = item.quantity - 1;
          const amount = qty * item.rate;
          const gstAmount = selectedSupplier?.gstApplicable ? amount * (item.gstPercentage / 100) : 0;
          newItems[existingIndex] = {
            ...item,
            quantity: qty,
            amount,
            gstAmount,
            total: amount + gstAmount
          };
          return { ...prev, items: newItems };
        } else {
          return { ...prev, items: existingItems.filter(li => li.itemId !== itemId) };
        }
      }
      return prev;
    });
  };

  const updatePOItem = (index: number, field: keyof TransactionItem, value: any) => {
    setPoFormData(prev => {
      const newItems = [...(prev.items || [])];
      const item = { ...newItems[index], [field]: value };
      
      if (field === "quantity" || field === "rate" || field === "gstPercentage") {
        item.amount = item.quantity * item.rate;
        item.gstAmount = selectedSupplier?.gstApplicable ? item.amount * (item.gstPercentage / 100) : 0;
        item.total = item.amount + item.gstAmount;
      }
      
      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const removePOItem = (index: number) => {
    setPoFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const supplier = suppliers.find(s => s.id === po.supplierId);
    return supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) || po.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const subtotal = poFormData.items?.reduce((acc, i) => acc + i.amount, 0) || 0;
  const totalGst = poFormData.items?.reduce((acc, i) => acc + i.gstAmount, 0) || 0;
  const grandTotal = subtotal + totalGst;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Purchase Orders</h1>
          <p className="text-slate-500 font-medium mt-1">Create and manage your procurement lifecycle.</p>
        </div>
        <div className="flex items-center gap-3">
          {view === "list" ? (
            <Button onClick={() => setView("form")} icon={Plus} className="shadow-lg shadow-indigo-200">
              New Purchase Order
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setView("list")} icon={ArrowLeft}>
              Back to List
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  placeholder="Search by PO number or supplier..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card className="border-none ring-1 ring-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">PO Number</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Supplier</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Total Amount</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPOs.map(po => (
                      <motion.tr 
                        layout
                        key={po.id} 
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900">#{po.id.toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatDate(po.date)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{suppliers.find(s => s.id === po.supplierId)?.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{suppliers.find(s => s.id === po.supplierId)?.city}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{po.items.length} items</td>
                        <td className="px-6 py-4 text-sm font-black text-indigo-600">{formatCurrency(po.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg",
                            po.status === "Received" ? "bg-emerald-100 text-emerald-700" :
                            po.status === "Sent" ? "bg-blue-100 text-blue-700" :
                            "bg-slate-100 text-slate-700"
                          )}>
                            {po.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {po.status === "Sent" && (
                              <Link to="/inventory/grn">
                                <Button variant="outline" size="sm" className="text-[10px] h-8 font-black uppercase tracking-widest">
                                  Receive
                                </Button>
                              </Link>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ChevronRight size={16} />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredPOs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Package size={48} strokeWidth={1} />
                            <p className="font-medium italic">No purchase orders found matching your search.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none ring-1 ring-slate-100 shadow-xl shadow-slate-200/20">
                  <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Select
                          label="Supplier"
                          required
                          value={poFormData.supplierId}
                          onChange={e => setPoFormData({ ...poFormData, supplierId: e.target.value })}
                          options={[
                            { label: "Select Supplier...", value: "" },
                            ...suppliers.map(s => ({ label: s.name, value: s.id }))
                          ]}
                        />
                        {selectedSupplier && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 px-1"
                          >
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                              selectedSupplier.gstApplicable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                            )}>
                              {selectedSupplier.gstApplicable ? "GST Applicable" : "GST Not Applicable"}
                            </span>
                            {selectedSupplier.gstNumber && (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                GSTIN: {selectedSupplier.gstNumber}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </div>
                      <Input 
                        label="PO Date" 
                        type="date" 
                        required 
                        value={poFormData.date} 
                        onChange={e => setPoFormData({ ...poFormData, date: e.target.value })} 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">Order Items</h3>
                        <Button variant="outline" size="sm" onClick={() => setIsItemModalOpen(true)} className="rounded-xl">
                          <Plus size={16} className="mr-2" /> Add Items
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <AnimatePresence initial={false}>
                          {poFormData.items?.map((item, idx) => (
                            <motion.div
                              key={item.itemId}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <Package size={20} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900">{items.find(i => i.id === item.itemId)?.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                      {items.find(i => i.id === item.itemId)?.itemCode} • {items.find(i => i.id === item.itemId)?.uom}
                                    </p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => removePOItem(idx)}
                                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Input 
                                  label="Quantity"
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={e => updatePOItem(idx, "quantity", Number(e.target.value))}
                                />
                                <Input 
                                  label="Rate"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={e => updatePOItem(idx, "rate", Number(e.target.value))}
                                />
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">GST %</label>
                                  <div className="flex items-center gap-2 h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700">
                                    {selectedSupplier?.gstApplicable ? `${item.gstPercentage}%` : "0%"}
                                    {selectedSupplier?.gstApplicable && (
                                      <span className="text-[10px] text-slate-400 ml-auto">
                                        +{formatCurrency(item.gstAmount)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Input 
                                  label="Exp. Delivery"
                                  type="date"
                                  value={item.expectedDeliveryDate || ""}
                                  onChange={e => updatePOItem(idx, "expectedDeliveryDate", e.target.value)}
                                />
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <Info size={12} />
                                  Item Total (Inc. GST)
                                </div>
                                <div className="text-sm font-black text-slate-900">
                                  {formatCurrency(item.total)}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {(!poFormData.items || poFormData.items.length === 0) && (
                          <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                            <div className="flex flex-col items-center gap-3 text-slate-300">
                              <ShoppingCart size={48} strokeWidth={1} />
                              <p className="font-bold text-sm">No items added to this order yet.</p>
                              <Button variant="outline" size="sm" onClick={() => setIsItemModalOpen(true)} className="mt-2">
                                Browse Items
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-none ring-1 ring-slate-100 shadow-xl shadow-slate-200/20 sticky top-8">
                  <div className="p-6 space-y-6">
                    <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">Cost Summary</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Net Amount</span>
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Total GST</span>
                        <span className="text-sm font-bold text-emerald-600">+{formatCurrency(totalGst)}</span>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-black text-slate-900 uppercase tracking-tight">Grand Total</span>
                          <span className="text-xl font-black text-indigo-600">{formatCurrency(grandTotal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-2xl p-4 flex gap-3">
                      <AlertCircle className="text-indigo-600 shrink-0" size={20} />
                      <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
                        By generating this PO, you confirm that the items and rates are verified with the supplier.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Button 
                        className="w-full h-12 text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-200"
                        onClick={handleCreatePO}
                        disabled={!poFormData.supplierId || !poFormData.items?.length}
                      >
                        Generate PO
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full text-slate-400 hover:text-slate-600"
                        onClick={() => setView("list")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Select Items" size="xl">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Search by name or item code..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                value={itemSearchTerm}
                onChange={(e) => setItemSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  selectedCategory === "all" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                    selectedCategory === cat.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar p-1">
            {items
              .filter(i => {
                const matchesSearch = i.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) || 
                                     i.itemCode.toLowerCase().includes(itemSearchTerm.toLowerCase());
                const matchesCategory = selectedCategory === "all" || i.categoryId === selectedCategory;
                return matchesSearch && matchesCategory;
              })
              .map(item => {
                const inCart = poFormData.items?.find(li => li.itemId === item.id);
                return (
                  <motion.div 
                    layout
                    key={item.id} 
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-2xl border transition-all group relative",
                      inCart ? "border-indigo-500 bg-indigo-50/50 shadow-sm" : "bg-white border-slate-100 hover:border-indigo-300 hover:shadow-md"
                    )}
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-50 relative overflow-hidden border border-slate-100 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {item.itemCode} • {item.uom}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-indigo-600">{formatCurrency(item.purchaseRate)}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Stock: {item.stock}</p>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 w-32">
                      {inCart ? (
                        <div className="flex items-center justify-between bg-white rounded-xl border border-indigo-200 p-1 shadow-sm">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDecrementItemFromPO(item.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-rose-500 hover:text-white transition-all"
                          >
                            {inCart.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                          </button>
                          <span className="text-xs font-black text-slate-800">{inCart.quantity}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAddItemToPO(item.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAddItemToPO(item.id)}
                          className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                        >
                          <Plus size={12} /> Add to Order
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-sm font-bold text-slate-500">
              {poFormData.items?.length || 0} items selected
            </div>
            <Button onClick={() => setIsItemModalOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
