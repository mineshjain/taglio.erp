import React, { useState, useMemo } from "react";
import { useApp } from "@/AppContext";
import { Card, Button, Input, Select } from "@/components/ui";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  FileText, Download, Filter, TrendingUp, Package, 
  Users, CreditCard, Calendar, User as UserIcon,
  ArrowUpRight, ArrowDownRight, Activity, Target, AlertCircle, Clock, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Reports: React.FC = () => {
  const { leads, salesOrders, items, invoices, payments, users, clients, currentUser } = useApp();
  
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedSalesperson, setSelectedSalesperson] = useState("all");
  const [activeReport, setActiveReport] = useState<"sales" | "inventory" | "payments" | "leads">("sales");

  const canExport = currentUser?.role === "admin" || currentUser?.permissions?.["reports"]?.export;

  // Filtering logic
  const filteredData = useMemo(() => {
    let filteredInvoices = [...invoices];
    let filteredOrders = [...salesOrders];
    let filteredLeads = [...leads];
    let filteredPayments = [...payments];

    if (dateRange.start) {
      const start = new Date(dateRange.start);
      filteredInvoices = filteredInvoices.filter(i => new Date(i.date) >= start);
      filteredOrders = filteredOrders.filter(o => new Date(o.date) >= start);
      filteredLeads = filteredLeads.filter(l => new Date(l.createdAt) >= start);
      filteredPayments = filteredPayments.filter(p => new Date(p.date) >= start);
    }

    if (dateRange.end) {
      const end = new Date(dateRange.end);
      filteredInvoices = filteredInvoices.filter(i => new Date(i.date) <= end);
      filteredOrders = filteredOrders.filter(o => new Date(o.date) <= end);
      filteredLeads = filteredLeads.filter(l => new Date(l.createdAt) <= end);
      filteredPayments = filteredPayments.filter(p => new Date(p.date) <= end);
    }

    if (selectedSalesperson !== "all") {
      filteredOrders = filteredOrders.filter(o => o.salespersonId === selectedSalesperson);
      filteredLeads = filteredLeads.filter(l => l.assignedTo === selectedSalesperson);
    }

    return { filteredInvoices, filteredOrders, filteredLeads, filteredPayments };
  }, [dateRange, selectedSalesperson, invoices, salesOrders, leads, payments]);

  // Sales Performance Data
  const salesPerformanceData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredData.filteredInvoices.forEach(inv => {
      const month = new Date(inv.date).toLocaleString('default', { month: 'short' });
      data[month] = (data[month] || 0) + inv.totalAmount;
    });
    return Object.entries(data).map(([name, sales]) => ({ name, sales }));
  }, [filteredData.filteredInvoices]);

  // Inventory Status Data
  const inventoryStatusData = useMemo(() => {
    return items.map(item => ({
      name: item.name,
      stock: item.stock,
      value: item.stock * item.sellingPrice,
      type: item.type
    }));
  }, [items]);

  // Lead Conversion Data
  const leadConversionData = useMemo(() => {
    const total = filteredData.filteredLeads.length;
    const won = filteredData.filteredLeads.filter(l => l.status === "Closed Won").length;
    const lost = filteredData.filteredLeads.filter(l => l.status === "Closed Lost").length;
    const inPipeline = total - won - lost;

    return [
      { name: "Won", value: won, color: "#10b981" },
      { name: "Lost", value: lost, color: "#ef4444" },
      { name: "In Pipeline", value: inPipeline, color: "#6366f1" },
    ];
  }, [filteredData.filteredLeads]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Analyze your business performance with detailed insights.</p>
        </motion.div>
        {canExport && (
          <motion.div variants={itemVariants}>
            <Button className="rounded-2xl h-12 px-6 shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95" icon={Download}>
              Export All Reports
            </Button>
          </motion.div>
        )}
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-none ring-1 ring-slate-100 shadow-xl shadow-slate-200/20 overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Calendar size={12} className="text-indigo-500" /> Start Date
              </label>
              <Input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <Calendar size={12} className="text-indigo-500" /> End Date
              </label>
              <Input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <UserIcon size={12} className="text-indigo-500" /> Salesperson
              </label>
              <Select 
                value={selectedSalesperson} 
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                options={[
                  { label: "All Salespersons", value: "all" },
                  ...users.filter(u => u.role !== "Staff").map(u => ({ label: u.name, value: u.id }))
                ]}
                className="rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all"
              />
            </div>
            <Button 
              variant="outline" 
              className="rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest" 
              onClick={() => { setDateRange({ start: "", end: "" }); setSelectedSalesperson("all"); }}
            >
              Reset Filters
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Report Navigation */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl w-fit border border-slate-200/50">
        {[
          { id: "sales", label: "Sales", icon: TrendingUp },
          { id: "inventory", label: "Inventory", icon: Package },
          { id: "payments", label: "Payments", icon: CreditCard },
          { id: "leads", label: "Leads", icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300",
              activeReport === tab.id 
                ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100" 
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <tab.icon size={14} className={activeReport === tab.id ? "text-indigo-600" : "text-slate-400"} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeReport}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-8"
        >
          {activeReport === "sales" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <TrendingUp size={24} />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-400/20 text-emerald-300 text-[10px] font-black">
                        <ArrowUpRight size={12} /> +12%
                      </div>
                    </div>
                    <p className="text-indigo-100 font-black text-[10px] uppercase tracking-[0.2em]">Total Revenue</p>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter">{formatCurrency(filteredData.filteredInvoices.reduce((acc, i) => acc + i.totalAmount, 0))}</h3>
                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                      <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">{filteredData.filteredInvoices.length} Invoices</p>
                      <Activity size={16} className="text-indigo-300 opacity-50" />
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Target size={24} />
                    </div>
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Avg. Order Value</p>
                  <h3 className="text-4xl font-black mt-2 text-slate-900 tracking-tighter">
                    {formatCurrency(filteredData.filteredInvoices.length > 0 
                      ? filteredData.filteredInvoices.reduce((acc, i) => acc + i.totalAmount, 0) / filteredData.filteredInvoices.length 
                      : 0)}
                  </h3>
                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Per Transaction</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Clock size={24} />
                    </div>
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Open Orders Value</p>
                  <h3 className="text-4xl font-black mt-2 text-slate-900 tracking-tighter">{formatCurrency(filteredData.filteredOrders.filter(o => o.status === "Pending").reduce((acc, o) => acc + o.totalAmount, 0))}</h3>
                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Pending Confirmation</p>
                  </div>
                </motion.div>
              </div>
              
              <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/20 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Trend</h3>
                    <p className="text-sm font-medium text-slate-400">Monthly sales performance overview</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 800 }} dx={-10} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "16px" }}
                      />
                      <Bar dataKey="sales" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {activeReport === "inventory" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-emerald-600 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Package size={24} />
                      </div>
                    </div>
                    <p className="text-emerald-100 font-black text-[10px] uppercase tracking-[0.2em]">Total Inventory Value</p>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter">{formatCurrency(items.reduce((acc, i) => acc + (i.stock * i.sellingPrice), 0))}</h3>
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">{items.length} Unique Items</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                      <AlertCircle size={24} />
                    </div>
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Low Stock Items</p>
                  <h3 className="text-4xl font-black mt-2 text-rose-600 tracking-tighter">{items.filter(i => i.stock < 10).length}</h3>
                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Below Threshold (10)</p>
                  </div>
                </motion.div>
              </div>

              <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/20 p-0 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Inventory Valuation</h3>
                  <p className="text-sm font-medium text-slate-400">Stock levels and value by item</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Item Name</th>
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Type</th>
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] text-right">Stock</th>
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] text-right">Unit Price</th>
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] text-right">Total Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {inventoryStatusData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-all group">
                          <td className="px-8 py-5 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</td>
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-slate-100 text-slate-600">
                              {item.type}
                            </span>
                          </td>
                          <td className={cn("px-8 py-5 text-right font-black", item.stock < 10 ? "text-rose-600" : "text-slate-700")}>
                            {item.stock}
                          </td>
                          <td className="px-8 py-5 text-right text-slate-500 font-bold">{formatCurrency(item.value / (item.stock || 1))}</td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">{formatCurrency(item.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeReport === "payments" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <CreditCard size={24} />
                      </div>
                    </div>
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Total Collected</p>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter">{formatCurrency(filteredData.filteredPayments.reduce((acc, p) => acc + p.amount, 0))}</h3>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                      <ArrowDownRight size={24} />
                    </div>
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Outstanding Amount</p>
                  <h3 className="text-4xl font-black mt-2 text-rose-600 tracking-tighter">
                    {formatCurrency(
                      invoices.reduce((acc, i) => acc + i.totalAmount, 0) - 
                      payments.reduce((acc, p) => acc + p.amount, 0)
                    )}
                  </h3>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 size={24} />
                    </div>
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Collection Rate</p>
                  <h3 className="text-4xl font-black mt-2 text-emerald-600 tracking-tighter">
                    {Math.round((payments.reduce((acc, p) => acc + p.amount, 0) / (invoices.reduce((acc, i) => acc + i.totalAmount, 0) || 1)) * 100)}%
                  </h3>
                </motion.div>
              </div>

              <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/20 p-0 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Payment History</h3>
                  <p className="text-sm font-medium text-slate-400">Detailed customer payment records</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Date</th>
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Invoice #</th>
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Method</th>
                        <th className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredData.filteredPayments.map((payment) => {
                        const invoice = invoices.find(i => i.id === payment.invoiceId);
                        const client = clients.find(c => c.id === invoice?.clientId);
                        return (
                          <tr key={payment.id} className="hover:bg-slate-50/80 transition-all group">
                            <td className="px-8 py-5 text-xs text-slate-500 font-black uppercase tracking-widest">{formatDate(payment.date)}</td>
                            <td className="px-8 py-5 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{client?.name || "Unknown"}</td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                                #{payment.invoiceId.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-slate-100 text-slate-600">
                                {payment.method}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right font-black text-emerald-600">{formatCurrency(payment.amount)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeReport === "leads" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-violet-600 text-white shadow-2xl shadow-violet-200 relative overflow-hidden group"
                >
                  <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Users size={24} />
                      </div>
                    </div>
                    <p className="text-violet-100 font-black text-[10px] uppercase tracking-[0.2em]">Total Leads</p>
                    <h3 className="text-4xl font-black mt-2 tracking-tighter">{filteredData.filteredLeads.length}</h3>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                      <Target size={24} />
                    </div>
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Conversion Rate</p>
                  <h3 className="text-4xl font-black mt-2 text-emerald-600 tracking-tighter">
                    {Math.round((filteredData.filteredLeads.filter(l => l.status === "Closed Won").length / (filteredData.filteredLeads.length || 1)) * 100)}%
                  </h3>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                      <TrendingUp size={24} />
                    </div>
                  </div>
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Pipeline Value</p>
                  <h3 className="text-4xl font-black mt-2 text-indigo-600 tracking-tighter">
                    {formatCurrency(filteredData.filteredLeads.filter(l => l.status !== "Closed Won" && l.status !== "Closed Lost").reduce((acc, l) => acc + l.value, 0))}
                  </h3>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/20 p-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Conversion Breakdown</h3>
                  <p className="text-sm font-medium text-slate-400 mb-8">Lead outcomes distribution</p>
                  <div className="h-[350px] w-full flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadConversionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {leadConversionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: "24px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "16px" }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/20 p-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Salesperson Performance</h3>
                  <p className="text-sm font-medium text-slate-400 mb-8">Lead conversion by team member</p>
                  <div className="space-y-8">
                    {users.filter(u => u.role !== "Staff").map(user => {
                      const userLeads = filteredData.filteredLeads.filter(l => l.assignedTo === user.id);
                      const won = userLeads.filter(l => l.status === "Closed Won").length;
                      const rate = Math.round((won / (userLeads.length || 1)) * 100);
                      
                      return (
                        <div key={user.id} className="space-y-3">
                          <div className="flex justify-between items-end">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-800 text-sm">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{userLeads.length} Leads Assigned</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-indigo-600">{rate}%</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Conversion</p>
                            </div>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${rate}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
