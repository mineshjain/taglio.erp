import React, { useState } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { 
  Plus, Search, Receipt, CreditCard, 
  DollarSign, Clock, CheckCircle2, 
  AlertCircle, Printer, Send, Download,
  ArrowLeft, MoreVertical, Calendar, ArrowRight,
  TrendingUp, Wallet, History, FileText
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Invoice, Payment, SalesOrder } from "@/types";
import { motion, AnimatePresence } from "motion/react";

export const BillingPage: React.FC = () => {
  const { invoices, payments, salesOrders, clients, items, addInvoice, addPayment, addInventoryTransaction, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<SalesOrder | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentData, setPaymentData] = useState<Partial<Payment>>({
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    method: "Bank Transfer"
  });

  const canCreate = currentUser?.role === "admin" || currentUser?.permissions?.["billing"]?.create;
  const canExport = currentUser?.role === "admin" || currentUser?.permissions?.["billing"]?.export;

  const handleSelectOrderForInvoice = (order: SalesOrder) => {
    setSelectedOrderForInvoice(order);
    setInvoiceItems(order.items.map(item => ({
      ...item,
      invoiceQuantity: item.quantity,
      error: ""
    })));
    setIsModalOpen(false);
  };

  const updateInvoiceQuantity = (itemId: string, qty: number) => {
    const client = clients.find(c => c.id === selectedOrderForInvoice?.clientId);
    setInvoiceItems(invoiceItems.map(item => {
      if (item.itemId === itemId) {
        const stockItem = items.find(i => i.id === itemId);
        const maxAllowed = item.quantity * (1 + (item.tolerancePercentage || 0) / 100);
        let error = "";
        
        if (qty > (stockItem?.stock || 0)) {
          error = `Cannot exceed stock (${stockItem?.stock || 0})`;
        } else if (qty > maxAllowed) {
          error = `Exceeds tolerance max (${maxAllowed})`;
        }

        const amount = qty * item.rate;
        const gstAmount = client?.gstApplicable ? amount * (item.gstPercentage / 100) : 0;
        
        return { 
          ...item, 
          invoiceQuantity: qty, 
          amount, 
          gstAmount, 
          total: amount + gstAmount,
          error
        };
      }
      return item;
    }));
  };

  const handleCreateInvoice = () => {
    if (!selectedOrderForInvoice) return;
    
    // Check for errors
    if (invoiceItems.some(i => i.error)) return;

    const finalItems = invoiceItems.map(({ invoiceQuantity, error, ...rest }) => ({
      ...rest,
      quantity: invoiceQuantity
    }));

    const subtotal = finalItems.reduce((acc, i) => acc + i.amount, 0);
    const totalGst = finalItems.reduce((acc, i) => acc + i.gstAmount, 0);
    const totalAmount = subtotal + totalGst;

    const invoiceId = Math.random().toString(36).substr(2, 9);

    addInvoice({
      id: invoiceId,
      clientId: selectedOrderForInvoice.clientId,
      items: finalItems,
      subtotal,
      totalGst,
      totalAmount,
      createdAt: new Date().toISOString(),
      orderId: selectedOrderForInvoice.id,
      status: "Unpaid",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Deduct stock
    finalItems.forEach(item => {
      addInventoryTransaction({
        id: Math.random().toString(36).substr(2, 9),
        type: "Issue",
        itemId: item.itemId,
        quantity: item.quantity,
        referenceId: invoiceId,
        date: new Date().toISOString(),
        notes: `Auto-deducted for Invoice #${invoiceId.toUpperCase()}`
      });
    });

    setSelectedOrderForInvoice(null);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !paymentData.amount) return;

    addPayment({
      id: Math.random().toString(36).substr(2, 9),
      invoiceId: selectedInvoiceId,
      ...paymentData as Payment
    });
    setIsPaymentModalOpen(false);
    setPaymentData({ amount: 0, date: new Date().toISOString().split("T")[0], method: "Bank Transfer" });
  };

  const filteredInvoices = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    return client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getInvoiceBalance = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return 0;
    const paid = payments.filter(p => p.invoiceId === invoiceId).reduce((acc, p) => acc + p.amount, 0);
    return invoice.totalAmount - paid;
  };

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const outstanding = totalInvoiced - totalCollected;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing & Payments</h1>
          <p className="text-slate-500 font-medium mt-1">Manage invoices, track payments, and monitor cash flow.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canCreate && (
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(true)} className="py-6 px-6 font-black uppercase tracking-widest border-2">
                <Receipt size={20} className="mr-2" /> Create from Order
              </Button>
              <Button onClick={() => setIsPaymentModalOpen(true)} className="py-6 px-8 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200">
                <CreditCard size={20} className="mr-2" /> Record Payment
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Invoiced", value: totalInvoiced, icon: FileText, color: "indigo" },
          { label: "Total Collected", value: totalCollected, icon: Wallet, color: "emerald" },
          { label: "Outstanding", value: outstanding, icon: TrendingUp, color: "rose" },
          { label: "Pending Invoices", value: invoices.filter(i => i.status !== "Paid").length, icon: Clock, color: "amber", isCurrency: false },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={cn(
              "border-none shadow-2xl p-6 relative overflow-hidden group",
              stat.color === "indigo" ? "bg-indigo-600 shadow-indigo-200/50" :
              stat.color === "emerald" ? "bg-emerald-600 shadow-emerald-200/50" :
              stat.color === "rose" ? "bg-rose-600 shadow-rose-200/50" :
              "bg-amber-600 shadow-amber-200/50"
            )}>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{stat.label}</p>
                <h3 className="text-3xl font-black text-white mt-2">
                  {stat.isCurrency === false ? stat.value : formatCurrency(stat.value as number)}
                </h3>
              </div>
              <stat.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-500" />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 p-0 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Receipt className="text-indigo-600" size={24} />
                Invoices
              </h2>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full md:w-72 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Search className="text-slate-400" size={18} />
                <input 
                  placeholder="Search invoices..." 
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
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {filteredInvoices.map((inv, idx) => {
                      const client = clients.find(c => c.id === inv.clientId);
                      const balance = getInvoiceBalance(inv.id);
                      return (
                        <motion.tr 
                          key={inv.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                        >
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-wider">#{inv.id.toUpperCase()}</span>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{formatDate(inv.createdAt)}</p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                                {client?.name[0]}
                              </div>
                              <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{client?.name}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-sm font-black text-slate-800">{formatCurrency(inv.totalAmount)}</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className={cn(
                              "text-sm font-black",
                              balance > 0 ? "text-rose-600" : "text-emerald-600"
                            )}>{formatCurrency(balance)}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl",
                              balance === 0 ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-amber-100 text-amber-700 border border-amber-200"
                            )}>
                              {balance === 0 ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {canExport && (
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Printer size={18} /></button>
                              )}
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Send size={18} /></button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Receipt size={64} strokeWidth={1} className="opacity-10 mb-2" />
                          <p className="italic font-bold text-lg">No invoices found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 p-0 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <History className="text-emerald-600" size={24} />
                Recent Payments
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <AnimatePresence>
                {payments.slice().reverse().map((p, idx) => (
                  <motion.div 
                    key={p.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 border border-slate-100 group-hover:scale-110 transition-transform">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">#{p.invoiceId.toUpperCase()}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{p.method} • {formatDate(p.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-600">+{formatCurrency(p.amount)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {payments.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <DollarSign size={48} strokeWidth={1} className="mx-auto opacity-10 mb-2" />
                  <p className="italic font-bold">No payments recorded yet.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Create from Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Invoice from Sales Order">
        <div className="space-y-6 p-2">
          <p className="text-sm text-slate-500 font-medium">Select a confirmed sales order to generate an invoice.</p>
          <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {salesOrders.filter(o => !invoices.some(i => i.orderId === o.id)).map(order => (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={order.id} 
                onClick={() => handleSelectOrderForInvoice(order)}
                className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-indigo-500 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-black text-xl border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {clients.find(c => c.id === order.clientId)?.name[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{clients.find(c => c.id === order.clientId)?.name}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Order #{order.id.toUpperCase()} • {formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-lg font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Select Order</span>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </motion.div>
            ))}
            {salesOrders.filter(o => !invoices.some(i => i.orderId === o.id)).length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <AlertCircle size={48} strokeWidth={1} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 font-bold italic">No pending sales orders found.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Invoice Generation Modal */}
      <Modal isOpen={!!selectedOrderForInvoice} onClose={() => setSelectedOrderForInvoice(null)} title="Generate Invoice">
        <div className="space-y-8 p-2">
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Client Details</h4>
                <p className="text-xl font-black text-indigo-900">{clients.find(c => c.id === selectedOrderForInvoice?.clientId)?.name}</p>
              </div>
              <div className="text-right">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Order Reference</h4>
                <p className="text-lg font-black text-indigo-900">#{selectedOrderForInvoice?.id.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Item</th>
                  <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Order Qty</th>
                  <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stock</th>
                  <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center w-32">Invoice Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoiceItems.map((item, idx) => {
                  const stockItem = items.find(i => i.id === item.itemId);
                  return (
                    <tr key={idx}>
                      <td className="py-4">
                        <p className="font-black text-slate-800">{stockItem?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stockItem?.itemCode}</p>
                      </td>
                      <td className="py-4 text-center font-black text-slate-600">{item.quantity}</td>
                      <td className="py-4 text-center">
                        <span className={cn(
                          "text-[10px] font-black px-2 py-1 rounded-lg",
                          (stockItem?.stock || 0) < item.quantity ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {stockItem?.stock || 0} Available
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col items-center">
                          <Input 
                            type="number" 
                            min="1" 
                            value={item.invoiceQuantity} 
                            onChange={e => updateInvoiceQuantity(item.itemId, Number(e.target.value))} 
                            className={cn(
                              "h-10 text-center font-black rounded-xl border-2",
                              item.error ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-100 focus:border-indigo-500"
                            )}
                          />
                          {item.error && <span className="text-[10px] text-rose-500 font-black mt-1 uppercase tracking-tighter">{item.error}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" onClick={() => setSelectedOrderForInvoice(null)} className="py-6 px-8 font-black uppercase tracking-widest border-2">Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={invoiceItems.some(i => i.error)} className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
              Generate & Deduct Stock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={handleAddPayment} className="space-y-8 p-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Receipt size={14} /> Select Invoice
            </label>
            <Select 
              options={[
                { label: "Select Invoice", value: "" },
                ...invoices.filter(i => getInvoiceBalance(i.id) > 0).map(i => ({ 
                  label: `${clients.find(c => c.id === i.clientId)?.name} - #${i.id.toUpperCase()} (Bal: ${formatCurrency(getInvoiceBalance(i.id))})`, 
                  value: i.id 
                }))
              ]} 
              value={selectedInvoiceId}
              onChange={e => setSelectedInvoiceId(e.target.value)}
              required
              className="h-12 rounded-xl border-2 border-slate-100 focus:border-emerald-500 transition-all font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} /> Amount Paid
              </label>
              <Input 
                type="number" 
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={paymentData.amount || ""}
                onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                required
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-emerald-500 transition-all font-black text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Payment Date
              </label>
              <Input 
                type="date" 
                value={paymentData.date}
                onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                required
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-emerald-500 transition-all font-black"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={14} /> Payment Method
            </label>
            <Select 
              options={[
                { label: "Bank Transfer", value: "Bank Transfer" },
                { label: "Cash", value: "Cash" },
                { label: "Cheque", value: "Cheque" },
                { label: "Online", value: "Online" },
              ]} 
              value={paymentData.method}
              onChange={e => setPaymentData({...paymentData, method: e.target.value as any})}
              required
              className="h-12 rounded-xl border-2 border-slate-100 focus:border-emerald-500 transition-all font-bold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsPaymentModalOpen(false)} className="py-6 px-8 font-black uppercase tracking-widest border-2">Cancel</Button>
            <Button type="submit" className="py-6 px-8 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200">
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
