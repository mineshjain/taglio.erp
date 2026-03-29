import React, { useState, useEffect } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { 
  Plus, Search, PackageCheck, ArrowLeft, CheckCircle2, FileText, 
  Truck, ClipboardList, AlertCircle, ChevronRight, Calendar,
  Check, X, Info
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { PurchaseOrder, GRN as GRNType } from "@/types";
import { motion, AnimatePresence } from "motion/react";

export const GRNPage: React.FC = () => {
  const { items, purchaseOrders, addInventoryTransaction, updatePurchaseOrderStatus } = useApp();
  const [view, setView] = useState<"list" | "create">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [grnFormData, setGrnFormData] = useState({
    items: [] as any[],
    notes: "",
    date: new Date().toISOString().split("T")[0]
  });

  const handleSelectPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setGrnFormData({
      date: new Date().toISOString().split("T")[0],
      notes: "",
      items: po.items.map(item => ({
        itemId: item.itemId,
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity,
        acceptedQuantity: item.quantity,
        rejectedQuantity: 0
      }))
    });
    setView("create");
  };

  const updateGRNItem = (idx: number, field: string, value: number) => {
    const newItems = [...grnFormData.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    
    // Auto-calculate rejected if received and accepted are changed
    if (field === "receivedQuantity") {
      newItems[idx].acceptedQuantity = value;
      newItems[idx].rejectedQuantity = 0;
    } else if (field === "acceptedQuantity") {
      newItems[idx].rejectedQuantity = newItems[idx].receivedQuantity - value;
    } else if (field === "rejectedQuantity") {
      newItems[idx].acceptedQuantity = newItems[idx].receivedQuantity - value;
    }
    
    setGrnFormData({ ...grnFormData, items: newItems });
  };

  const handleCreateGRN = () => {
    if (!selectedPO) return;

    // 1. Add inventory transactions for each accepted item
    grnFormData.items.forEach(item => {
      if (item.acceptedQuantity > 0) {
        addInventoryTransaction({
          id: Math.random().toString(36).substr(2, 9),
          itemId: item.itemId,
          type: "GRN",
          quantity: item.acceptedQuantity,
          date: grnFormData.date,
          referenceId: selectedPO.id,
          notes: `GRN for PO #${selectedPO.id.toUpperCase()}. ${grnFormData.notes}`
        });
      }
    });

    // 2. Update PO status
    updatePurchaseOrderStatus(selectedPO.id, "Received");

    setView("list");
    setSelectedPO(null);
  };

  // Filter pending POs for selection
  const pendingPOs = purchaseOrders.filter(po => po.status === "Pending" || po.status === "Ordered");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Goods Receipt Notes (GRN)</h1>
          <p className="text-slate-500 font-medium mt-1">Receive materials against purchase orders and update stock.</p>
        </div>
        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button onClick={() => setView("create")} className="shadow-xl shadow-indigo-200 py-6 px-8 text-lg font-black">
                <Plus size={24} strokeWidth={3} /> New GRN
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="create-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button variant="outline" onClick={() => setView("list")} className="py-6 px-8 text-lg font-black border-2">
                <ArrowLeft size={24} strokeWidth={3} /> Back to List
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 p-0 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ClipboardList className="text-indigo-600" size={24} />
                  Pending Purchase Orders
                </h2>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full md:w-72 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <Search className="text-slate-400" size={18} />
                  <input 
                    placeholder="Search POs..." 
                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">PO ID</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Items</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingPOs
                      .filter(po => po.id.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((po, idx) => (
                      <motion.tr 
                        key={po.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                      >
                        <td className="px-8 py-5">
                          <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">#{po.id.toUpperCase()}</span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs text-slate-500 font-black uppercase tracking-wider">{formatDate(po.date)}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{po.supplierId}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <PackageCheck size={16} className="text-slate-400" />
                            <span className="text-sm font-black text-slate-600">{po.items.length} items</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleSelectPO(po)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                          >
                            Receive Items
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                    {pendingPOs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <Truck size={64} strokeWidth={1} className="opacity-10 mb-2" />
                            <p className="italic font-bold text-lg">No pending purchase orders found.</p>
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
            key="create-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto"
          >
            <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 overflow-hidden">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-200">
                      <PackageCheck size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Receive Materials</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">PO #{selectedPO?.id.toUpperCase()}</span>
                        <span className="text-slate-400 font-bold text-sm">•</span>
                        <p className="text-slate-500 font-bold text-sm">Supplier: {selectedPO?.supplierId}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                      <Calendar className="text-indigo-600" size={20} />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt Date</p>
                        <input 
                          type="date" 
                          value={grnFormData.date}
                          onChange={e => setGrnFormData({...grnFormData, date: e.target.value})}
                          className="bg-transparent border-none outline-none font-black text-slate-800 text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Item Name</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Ordered</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Received</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Accepted</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Rejected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {grnFormData.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black">
                                {items.find(i => i.id === item.itemId)?.name[0]}
                              </div>
                              <p className="font-black text-slate-800">{items.find(i => i.id === item.itemId)?.name}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-lg font-black text-slate-400">{item.orderedQuantity}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <div className="relative w-24">
                                <input 
                                  type="number" 
                                  min="0" 
                                  max={item.orderedQuantity}
                                  value={item.receivedQuantity} 
                                  onChange={e => updateGRNItem(idx, "receivedQuantity", Number(e.target.value))} 
                                  className="w-full h-12 text-center font-black text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <div className="relative w-24">
                                <Check className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-500" size={14} strokeWidth={3} />
                                <input 
                                  type="number" 
                                  min="0" 
                                  max={item.receivedQuantity}
                                  value={item.acceptedQuantity} 
                                  onChange={e => updateGRNItem(idx, "acceptedQuantity", Number(e.target.value))} 
                                  className="w-full h-12 pl-6 text-center font-black text-emerald-600 bg-emerald-50 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center">
                              <div className="relative w-24">
                                <X className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-500" size={14} strokeWidth={3} />
                                <input 
                                  type="number" 
                                  min="0" 
                                  max={item.receivedQuantity}
                                  value={item.rejectedQuantity} 
                                  onChange={e => updateGRNItem(idx, "rejectedQuantity", Number(e.target.value))} 
                                  className="w-full h-12 pl-6 text-center font-black text-rose-600 bg-rose-50 border-2 border-rose-100 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-8 bg-slate-50/30 border-t border-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Info size={14} /> Notes / Remarks
                    </label>
                    <textarea 
                      className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[140px] resize-none font-medium text-slate-700 shadow-sm"
                      value={grnFormData.notes}
                      onChange={e => setGrnFormData({ ...grnFormData, notes: e.target.value })}
                      placeholder="Any observations regarding the delivery quality, packaging, etc..."
                    />
                  </div>
                  <div className="flex flex-col justify-end gap-4">
                    <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Accepted</p>
                        <p className="text-2xl font-black text-emerald-600">{grnFormData.items.reduce((acc, item) => acc + item.acceptedQuantity, 0)} Units</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Rejected</p>
                        <p className="text-2xl font-black text-rose-600">{grnFormData.items.reduce((acc, item) => acc + item.rejectedQuantity, 0)} Units</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setView("list")} className="flex-1 py-6 font-black uppercase tracking-widest border-2">Cancel</Button>
                      <Button onClick={handleCreateGRN} className="flex-[2] py-6 font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
                        Confirm Receipt & Update Stock
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
