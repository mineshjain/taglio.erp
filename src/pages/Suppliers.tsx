import React, { useState } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { 
  Plus, Search, Edit2, Trash2, Users,
  Building2, Mail, Phone, MapPin, Hash,
  Truck, ArrowRight, ShieldCheck, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Supplier } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import { AddressFields } from "@/components/AddressFields";

export const SuppliersMaster: React.FC = () => {
  const { suppliers, addSupplier } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<Supplier>>({
    gstApplicable: false,
    street: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    address: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({
      id: Math.random().toString(36).substr(2, 9),
      ...formData as Supplier
    });
    setIsModalOpen(false);
    setFormData({
      gstApplicable: false,
      street: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      address: ""
    });
  };

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Suppliers Master</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your vendor database and contact details.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
          <Plus size={20} className="mr-2" /> Add New Supplier
        </Button>
      </div>

      <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/20 p-8">
        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 ring-1 ring-slate-200/50">
          <Search className="text-slate-400 ml-2" size={20} />
          <input 
            placeholder="Search suppliers by name or email..." 
            className="bg-transparent border-none outline-none w-full text-slate-700 font-bold placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto -mx-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Address</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">GST Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filtered.map((supplier, idx) => (
                  <motion.tr 
                    key={supplier.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-black text-lg border border-violet-100 shadow-sm group-hover:scale-110 transition-transform">
                          {supplier.name[0]}
                        </div>
                        <span className="font-black text-slate-800 group-hover:text-violet-600 transition-colors">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-700">{supplier.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{supplier.phone}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-500 font-bold truncate max-w-xs flex items-center gap-2">
                        <MapPin size={12} className="text-slate-300" /> {supplier.address}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border",
                        supplier.gstApplicable ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                      )}>
                        {supplier.gstApplicable ? `GST: ${supplier.gstNumber}` : "No GST"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Truck size={40} strokeWidth={1} />
                    </div>
                    <p className="text-slate-400 italic font-bold uppercase tracking-widest text-xs">No suppliers found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Supplier">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={14} /> Supplier Name
            </label>
            <Input required value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Mail size={14} /> Email Address
              </label>
              <Input type="email" required value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Phone size={14} /> Phone Number
              </label>
              <Input type="tel" required value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold" />
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> Address Details
            </h3>
            <AddressFields formData={formData} setFormData={setFormData} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 cursor-pointer group hover:bg-indigo-100 transition-all" onClick={() => setFormData({...formData, gstApplicable: !formData.gstApplicable})}>
              <div className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                formData.gstApplicable ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200"
              )}>
                {formData.gstApplicable && <Plus size={16} strokeWidth={4} />}
              </div>
              <label className="text-sm font-black text-indigo-900 cursor-pointer uppercase tracking-wider">GST Applicable for this supplier</label>
            </div>
            
            <AnimatePresence>
              {formData.gstApplicable && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Hash size={14} /> GST Number
                    </label>
                    <Input required value={formData.gstNumber || ""} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-black" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="py-6 px-8 font-black uppercase tracking-widest border-2">Cancel</Button>
            <Button type="submit" className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
              Save Supplier
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
