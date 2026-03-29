import React, { useState } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { 
  Plus, Search, ArrowUpRight, ArrowLeft, CheckCircle2, 
  Package, History, Info, Calendar, Hash, Tag
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { InventoryTransaction } from "@/types";
import { motion, AnimatePresence } from "motion/react";

export const MaterialIssuePage: React.FC = () => {
  const { items, inventory, addInventoryTransaction } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<InventoryTransaction>>({
    type: "Issue",
    quantity: 0,
    date: new Date().toISOString().split("T")[0],
    referenceId: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || !formData.quantity) return;

    addInventoryTransaction({
      id: Math.random().toString(36).substr(2, 9),
      ...formData as InventoryTransaction,
      type: "Issue"
    });
    setIsModalOpen(false);
    setFormData({ type: "Issue", quantity: 0, date: new Date().toISOString().split("T")[0], referenceId: "" });
  };

  const issues = inventory.filter(tx => tx.type === "Issue");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Material Issues</h1>
          <p className="text-slate-500 font-medium mt-1">Issue raw materials or consumables to production or departments.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-xl shadow-rose-200 py-6 px-8 text-lg font-black bg-rose-600 hover:bg-rose-700">
          <Plus size={24} strokeWidth={3} /> New Issue
        </Button>
      </div>

      <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 p-0 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="text-rose-600" size={24} />
            Issue History
          </h2>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full md:w-72 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
            <Search className="text-slate-400" size={18} />
            <input 
              placeholder="Search by item name..." 
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
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Item Details</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dept/Ref</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {issues
                  .filter(tx => {
                    const item = items.find(i => i.id === tx.itemId);
                    return item?.name.toLowerCase().includes(searchTerm.toLowerCase());
                  })
                  .slice().reverse().map((tx, idx) => {
                  const item = items.find(i => i.id === tx.itemId);
                  return (
                    <motion.tr 
                      key={tx.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <p className="text-xs text-slate-500 font-black uppercase tracking-wider">{formatDate(tx.date)}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg border border-rose-100 shadow-sm group-hover:scale-110 transition-transform">
                            {item?.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 group-hover:text-rose-600 transition-colors">{item?.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item?.itemCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5">
                          <ArrowUpRight className="text-rose-500" size={14} strokeWidth={3} />
                          <p className="text-lg font-black text-rose-600">{tx.quantity}</p>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item?.uom}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-slate-100 text-slate-500 border border-slate-200">
                          {tx.referenceId || "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm text-slate-500 font-medium italic line-clamp-1">{tx.notes || "-"}</p>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {issues.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Package size={64} strokeWidth={1} className="opacity-10 mb-2" />
                      <p className="italic font-bold text-lg">No material issues found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Material Issue">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} /> Select Item
              </label>
              <Select 
                options={[
                  { label: "Choose an item...", value: "" },
                  ...items.map(i => ({ label: `${i.name} (${i.itemCode})`, value: i.id }))
                ]} 
                value={formData.itemId || ""}
                onChange={e => setFormData({...formData, itemId: e.target.value})}
                required
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-rose-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Issue Date
              </label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-rose-500 transition-all font-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Hash size={14} /> Quantity to Issue
              </label>
              <Input 
                type="number" 
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.quantity || ""}
                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                required
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-rose-500 transition-all font-black text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} /> Dept / Reference
              </label>
              <Input 
                placeholder="e.g. Production Line A"
                value={formData.referenceId || ""}
                onChange={e => setFormData({...formData, referenceId: e.target.value})}
                required
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-rose-500 transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Info size={14} /> Additional Notes
            </label>
            <textarea 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all min-h-[100px] resize-none font-medium text-slate-700 shadow-inner"
              value={formData.notes || ""}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Reason for issue, specific instructions, etc..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="py-6 px-8 font-black uppercase tracking-widest border-2">Cancel</Button>
            <Button type="submit" className="py-6 px-8 font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200">
              Complete Material Issue
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
