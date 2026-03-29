import React, { useState, useEffect } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { 
  Plus, Search, Trash2, Calculator, 
  FileText, ShoppingCart, Receipt, 
  ChevronRight, AlertCircle, CheckCircle2, 
  ArrowLeft, Printer, Send, Download, Image as ImageIcon,
  Users, Package, Minus
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Item, Client, TransactionItem, CostEstimation, Quote, SalesOrder } from "@/types";
import { motion, AnimatePresence } from "motion/react";

// --- Transaction Form Component ---
export const TransactionForm: React.FC<{ 
  type: "estimation" | "quote" | "order"; 
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ type, onSave, onCancel }) => {
  const { items, clients, categories, addEstimation, addQuote, addSalesOrder } = useApp();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [lineItems, setLineItems] = useState<TransactionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const client = clients.find(c => c.id === selectedClient);

  const addItem = (item: Item) => {
    const existing = lineItems.find(li => li.itemId === item.id);
    if (existing) {
      updateQuantity(item.id, existing.quantity + 1);
    } else {
      const amount = item.sellingRate;
      const gstAmount = client?.gstApplicable ? (amount * item.gstPercentage) / 100 : 0;
      setLineItems([...lineItems, {
        itemId: item.id,
        quantity: 1,
        rate: item.sellingRate,
        gstPercentage: item.gstPercentage,
        amount: amount,
        gstAmount: gstAmount,
        total: amount + gstAmount,
        tolerancePercentage: 0
      }]);
    }
  };

  const decrementItem = (itemId: string) => {
    const existing = lineItems.find(li => li.itemId === itemId);
    if (existing && existing.quantity > 1) {
      updateQuantity(itemId, existing.quantity - 1);
    } else if (existing && existing.quantity === 1) {
      removeItem(itemId);
    }
  };

  // Recalculate GST when client changes
  useEffect(() => {
    setLineItems(prev => prev.map(li => {
      const amount = li.quantity * li.rate;
      const gstAmount = client?.gstApplicable ? (amount * li.gstPercentage) / 100 : 0;
      return { ...li, amount, gstAmount, total: amount + gstAmount };
    }));
  }, [selectedClient, client?.gstApplicable]);

  const updateQuantity = (itemId: string, qty: number) => {
    setLineItems(lineItems.map(li => {
      if (li.itemId === itemId) {
        const amount = qty * li.rate;
        const gstAmount = client?.gstApplicable ? (amount * li.gstPercentage) / 100 : 0;
        return { ...li, quantity: qty, amount, gstAmount, total: amount + gstAmount };
      }
      return li;
    }));
  };

  const updateRate = (itemId: string, rate: number) => {
    setLineItems(lineItems.map(li => {
      if (li.itemId === itemId) {
        const amount = li.quantity * rate;
        const gstAmount = client?.gstApplicable ? (amount * li.gstPercentage) / 100 : 0;
        return { ...li, rate, amount, gstAmount, total: amount + gstAmount };
      }
      return li;
    }));
  };

  const updateTolerance = (itemId: string, tolerance: number) => {
    setLineItems(lineItems.map(li => {
      if (li.itemId === itemId) {
        return { ...li, tolerancePercentage: tolerance };
      }
      return li;
    }));
  };

  const removeItem = (itemId: string) => {
    setLineItems(lineItems.filter(li => li.itemId !== itemId));
  };

  const subtotal = lineItems.reduce((acc, li) => acc + li.amount, 0);
  const totalGst = lineItems.reduce((acc, li) => acc + li.gstAmount, 0);
  const totalAmount = subtotal + totalGst;

  const handleSave = () => {
    if (!selectedClient || lineItems.length === 0) return;
    
    const data = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: selectedClient,
      items: lineItems,
      subtotal,
      totalGst,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    if (type === "estimation") addEstimation(data);
    else if (type === "quote") addQuote({ ...data, validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
    else if (type === "order") addSalesOrder({ ...data, status: "Pending" });

    onSave(data);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-3 text-slate-400 hover:text-slate-800 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-transparent hover:border-slate-100">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight capitalize">New {type}</h1>
          <p className="text-slate-500 font-medium">Fill in the details to generate a new {type}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 overflow-visible">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800">Client Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Select Client" 
                options={[
                  { label: "Choose a client...", value: "" },
                  ...clients.map(c => ({ label: c.name, value: c.id }))
                ]} 
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
              />
              
              <AnimatePresence mode="wait">
                {client ? (
                  <motion.div 
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4"
                  >
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{client.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GST Status</p>
                      <p className="text-sm font-bold text-slate-700">
                        {client.gstApplicable ? "Applicable" : "Not Applicable"}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium italic">
                    Select a client to see details
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800">Items & Pricing</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsItemModalOpen(true)} className="rounded-xl border-slate-200 hover:bg-slate-50">
                <Plus size={16} /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider w-32">Qty</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Rate</th>
                    {type === "order" && <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider w-24">Tol. %</th>}
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">GST</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Total</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence initial={false}>
                    {lineItems.map(li => {
                      const item = items.find(i => i.id === li.itemId);
                      return (
                        <motion.tr 
                          key={li.itemId}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item?.image && <img src={item.image} className="w-10 h-10 rounded-lg object-cover border border-slate-100" referrerPolicy="no-referrer" />}
                              <div>
                                <p className="font-bold text-slate-800">{item?.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item?.itemCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={li.quantity}
                                onChange={e => updateQuantity(li.itemId, Number(e.target.value))}
                              />
                              <span className="text-[10px] font-black text-slate-400 uppercase">{item?.uom}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                              <input 
                                type="number" 
                                className="w-28 pl-6 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={li.rate}
                                onChange={e => updateRate(li.itemId, Number(e.target.value))}
                              />
                            </div>
                          </td>
                          {type === "order" && (
                            <td className="px-6 py-4">
                              <input 
                                type="number" 
                                className="w-16 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                value={li.tolerancePercentage || 0}
                                onChange={e => updateTolerance(li.itemId, Number(e.target.value))}
                              />
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">{formatCurrency(li.gstAmount)}</p>
                            <p className="text-[10px] text-slate-400 font-black">({li.gstPercentage}%)</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-black text-slate-900">{formatCurrency(li.total)}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => removeItem(li.itemId)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <ShoppingCart size={48} strokeWidth={1} className="opacity-20 mb-2" />
                          <p className="italic font-medium">No items added yet.</p>
                          <Button variant="ghost" size="sm" onClick={() => setIsItemModalOpen(true)} className="text-indigo-600 font-black uppercase tracking-widest text-[10px]">
                            Add your first item
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 bg-indigo-600 text-white p-0 overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 opacity-80">
                <Calculator size={20} />
                <h3 className="text-lg font-black uppercase tracking-widest">Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-xs font-black uppercase tracking-widest">Subtotal</span>
                  <span className="text-lg font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-xs font-black uppercase tracking-widest">Total GST</span>
                  <span className="text-lg font-bold">{formatCurrency(totalGst)}</span>
                </div>
                <div className="pt-6 border-t border-white/20 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-1">Grand Total</span>
                    <span className="text-4xl font-black tracking-tighter">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/10 border-t border-white/10">
              <Button 
                className="w-full bg-white text-indigo-600 hover:bg-slate-50 py-6 text-lg font-black shadow-xl shadow-indigo-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                onClick={handleSave}
                disabled={!selectedClient || lineItems.length === 0}
              >
                Generate {type}
              </Button>
            </div>
          </Card>

          <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={18} className="text-slate-400" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Notes & Terms</h3>
            </div>
            <textarea 
              placeholder="Enter any specific notes or terms..." 
              className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium resize-none placeholder:text-slate-300"
            />
          </Card>
        </div>
      </div>

      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Select Items" size="xl">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Search by name or item code..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  selectedCategory === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    selectedCategory === cat.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
                const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     i.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === "all" || i.categoryId === selectedCategory;
                return matchesSearch && matchesCategory;
              })
              .map(item => {
                const inCart = lineItems.find(li => li.itemId === item.id);
                return (
                  <motion.div 
                    layout
                    key={item.id} 
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-3xl border transition-all group relative",
                      inCart ? "border-indigo-500 bg-indigo-50/50 shadow-xl shadow-indigo-100/50" : "bg-white border-slate-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-200/50"
                    )}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 relative overflow-hidden border border-slate-100 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                          <ImageIcon size={24} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-black text-slate-800 text-sm leading-tight truncate group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                            {item.itemCode} • {item.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-slate-900">{formatCurrency(item.sellingRate)}</p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <Package size={10} className="text-slate-300" />
                            <p className="text-[10px] font-black text-slate-500">{item.stock}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 w-32">
                      {inCart ? (
                        <div className="flex items-center justify-between bg-white rounded-2xl border border-indigo-200 p-1 shadow-sm">
                          <button 
                            onClick={(e) => { e.stopPropagation(); decrementItem(item.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          >
                            {inCart.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                          </button>
                          <span className="text-sm font-black text-slate-900">{inCart.quantity}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); addItem(item); }}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addItem(item)}
                          className="w-full py-2.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
                        >
                          <Plus size={12} strokeWidth={3} /> Add
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">
                {lineItems.length}
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Items Selected</span>
            </div>
            <Button onClick={() => setIsItemModalOpen(false)} className="px-8">Done</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

// --- List View Components ---
export const TransactionList: React.FC<{ 
  type: "estimation" | "quote" | "order"; 
  data: any[]; 
  onNew: () => void;
}> = ({ type, data, onNew }) => {
  const { clients, addQuote, updateEstimation, currentUser } = useApp();

  const canCreate = currentUser?.role === "admin" || currentUser?.permissions?.["sales"]?.create;
  const canExport = currentUser?.role === "admin" || currentUser?.permissions?.["sales"]?.export;

  const handleGenerateQuote = (estimation: CostEstimation) => {
    const quoteData: Quote = {
      ...estimation,
      id: Math.random().toString(36).substr(2, 9),
      estimationId: estimation.id,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    addQuote(quoteData);
    updateEstimation(estimation.id, { status: 'Quoted' });
    alert("Quotation generated successfully!");
  };

  const handleSendEmail = (item: any) => {
    const client = clients.find(c => c.id === item.clientId);
    if (!client || !client.email) {
      alert("Client email not found!");
      return;
    }
    
    const subject = encodeURIComponent(`${type.toUpperCase()} #${item.id.toUpperCase()} from TAGLIO.ERP`);
    const body = encodeURIComponent(`Dear ${client.name},\n\nPlease find attached the ${type} #${item.id.toUpperCase()} for the amount of ${formatCurrency(item.totalAmount)}.\n\nThank you,\nTAGLIO.ERP`);
    
    // In a real app with a backend, we would use the user's SMTP config here.
    // For this client-side demo, we use a mailto link.
    window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
  };

  const handleSendWhatsApp = (item: any) => {
    const client = clients.find(c => c.id === item.clientId);
    if (!client || !client.phone) {
      alert("Client phone number not found!");
      return;
    }

    const message = encodeURIComponent(`Hello ${client.name},\n\nHere is your ${type} #${item.id.toUpperCase()} for ${formatCurrency(item.totalAmount)}.\n\nThank you,\nTAGLIO.ERP`);
    
    // Format phone number (remove non-digits)
    const phone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight capitalize">{type}s</h1>
          <p className="text-slate-500 font-medium mt-1">View and manage your {type}s efficiently.</p>
        </div>
        {canCreate && (
          <Button onClick={onNew} className="w-full md:w-auto shadow-xl shadow-indigo-200 py-6 px-8 text-lg font-black">
            <Plus size={24} strokeWidth={3} /> New {type}
          </Button>
        )}
      </div>

      <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">ID</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Client</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
                {(type === "order" || type === "estimation") && <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>}
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {data.map((item, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={item.id} 
                    className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">#{item.id.toUpperCase()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{clients.find(c => c.id === item.clientId)?.name}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-500 font-black uppercase tracking-wider">{formatDate(item.createdAt)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-base font-black text-slate-900">{formatCurrency(item.totalAmount)}</p>
                    </td>
                    {type === "order" && (
                      <td className="px-8 py-5">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm",
                          item.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {item.status}
                        </span>
                      </td>
                    )}
                    {type === "estimation" && (
                      <td className="px-8 py-5">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm",
                          item.status === "Quoted" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {item.status || "Draft"}
                        </span>
                      </td>
                    )}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {type === "estimation" && item.status !== "Quoted" && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleGenerateQuote(item); }} 
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                          >
                            Generate Quote
                          </button>
                        )}
                        {canExport && (
                          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-slate-100" title="Print"><Printer size={18} /></button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleSendEmail(item); }} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-slate-100" title="Send Email"><Send size={18} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleSendWhatsApp(item); }} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-slate-100" title="Send WhatsApp">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                        </button>
                        {canExport && (
                          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-slate-100" title="Download"><Download size={18} /></button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <FileText size={64} strokeWidth={1} className="opacity-10 mb-2" />
                      <p className="italic font-bold text-lg">No {type}s found yet.</p>
                      {canCreate && (
                        <Button variant="ghost" onClick={onNew} className="text-indigo-600 font-black uppercase tracking-widest text-xs">
                          Create your first {type}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};
