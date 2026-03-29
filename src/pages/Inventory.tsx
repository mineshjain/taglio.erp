import React, { useState } from "react";
import { useApp } from "@/AppContext";
import { Button, Card } from "@/components/ui";
import { 
  Search, Warehouse, 
  ArrowDownLeft, ArrowUpRight, 
  Package, History, AlertCircle, 
  ClipboardList, Truck, RefreshCw, 
  CheckCircle2, ArrowRightLeft, ChevronRight, TrendingUp
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { InventoryTransaction } from "@/types";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export const InventoryPage: React.FC = () => {
  const { items, inventory, categories } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionIcon = (type: InventoryTransaction["type"]) => {
    switch (type) {
      case "PO": return <ClipboardList className="text-indigo-600" size={18} />;
      case "GRN": return <Truck className="text-emerald-600" size={18} />;
      case "Issue": return <ArrowUpRight className="text-rose-600" size={18} />;
      case "Return": return <RefreshCw className="text-amber-600" size={18} />;
      case "Adjustment": return <AlertCircle className="text-purple-600" size={18} />;
      case "Transfer": return <ArrowRightLeft className="text-blue-600" size={18} />;
    }
  };

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time overview of stock levels and material movements.</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { to: "/inventory/grn", color: "emerald", icon: Truck, label: "GRNs", sub: "Goods Receipt" },
          { to: "/inventory/issue", color: "rose", icon: ArrowUpRight, label: "Issues", sub: "Material Issue" },
          { to: "/inventory/return", color: "amber", icon: RefreshCw, label: "Returns", sub: "Material Return" },
          { to: "/inventory/adjustment", color: "purple", icon: AlertCircle, label: "Adjustments", sub: "Stock Correction" },
        ].map((link, idx) => (
          <Link key={idx} to={link.to} className="group">
            <Card className={cn(
              "hover:ring-2 transition-all cursor-pointer h-full border-none shadow-xl shadow-slate-200/20 group-hover:shadow-2xl group-hover:-translate-y-1",
              `hover:ring-${link.color}-500`
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner",
                  `bg-${link.color}-50 text-${link.color}-600`
                )}>
                  <link.icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{link.label}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{link.sub}</p>
                </div>
                <ChevronRight className="ml-auto text-slate-300 group-hover:text-slate-400 transition-colors" size={20} />
              </div>
            </Card>
          </Link>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 p-0 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Package className="text-indigo-600" size={24} />
                Stock Status
              </h2>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full md:w-72 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <Search className="text-slate-400" size={18} />
                <input 
                  placeholder="Search items..." 
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
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Item Details</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Stock</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {filteredItems.map((item, idx) => (
                      <motion.tr 
                        key={item.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                              {item.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.itemCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-slate-100 text-slate-500 border border-slate-200">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-baseline gap-1.5">
                            <p className={cn(
                              "text-lg font-black",
                              (item.alertRequired && item.stock < (item.reorderThreshold || 0)) ? "text-rose-600" : "text-emerald-600"
                            )}>{item.stock}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.uom}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {(item.alertRequired && item.stock < (item.reorderThreshold || 0)) ? (
                            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 w-fit">
                              <AlertCircle size={14} strokeWidth={3} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Low Stock</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit">
                              <CheckCircle2 size={14} strokeWidth={3} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Healthy</span>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8">
          <Card className="border-none bg-slate-900 text-white shadow-2xl shadow-indigo-900/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <TrendingUp size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">Inventory Summary</h2>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
                  <p className="text-5xl font-black text-white">{items.length}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                    <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1">Low Stock</p>
                    <p className="text-2xl font-black text-rose-400">{items.filter(i => i.alertRequired && i.stock < (i.reorderThreshold || 0)).length}</p>
                  </div>
                  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Categories</p>
                    <p className="text-2xl font-black text-indigo-400">{categories.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <History className="text-indigo-600" size={20} />
                Recent Activity
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <AnimatePresence>
                {inventory.slice().reverse().slice(0, 6).map((tx, idx) => {
                  const item = items.find(i => i.id === tx.itemId);
                  return (
                    <motion.div 
                      key={tx.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 line-clamp-1">{item?.name}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tx.type} • {formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <p className={cn(
                        "text-sm font-black px-3 py-1 rounded-lg",
                        (tx.type === "GRN" || tx.type === "Return" || (tx.type === "Adjustment" && tx.quantity > 0)) ? "text-emerald-600 bg-emerald-50" : 
                        tx.type === "PO" ? "text-indigo-600 bg-indigo-50" : "text-rose-600 bg-rose-50"
                      )}>
                        {(tx.type === "GRN" || tx.type === "Return" || (tx.type === "Adjustment" && tx.quantity > 0)) ? "+" : 
                         tx.type === "PO" ? "" : "-"}{Math.abs(tx.quantity)}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {inventory.length === 0 && (
                <div className="text-center py-12 opacity-20">
                  <History size={48} className="mx-auto mb-2" />
                  <p className="text-sm font-black uppercase tracking-widest">No activity yet</p>
                </div>
              )}
              <Link to="/reports" className="flex items-center justify-center gap-2 w-full py-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 rounded-2xl transition-all mt-2">
                View Full History <ChevronRight size={16} />
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
