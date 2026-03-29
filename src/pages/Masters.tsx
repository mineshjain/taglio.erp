import React, { useState } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { 
  Plus, Search, Edit2, Trash2, UserCheck, Users, Tags, 
  Package, Settings, Upload, Image as ImageIcon,
  Building2, Mail, Phone, MapPin, Hash, Percent,
  ArrowRight, DollarSign, Box, ShieldCheck, AlertTriangle
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Item, ItemType, Category, Client, Supplier, User } from "@/types";
import { UOM_LIST } from "@/constants/uom";
import { motion, AnimatePresence } from "motion/react";
import { AddressFields } from "@/components/AddressFields";

// --- Clients Master ---
export const ClientsMaster: React.FC = () => {
  const { clients, addClient, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<Client>>({
    gstApplicable: false,
    street: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    address: ""
  });

  const canCreate = currentUser?.role === "admin" || currentUser?.permissions?.["masters"]?.create;
  const canEdit = currentUser?.role === "admin" || currentUser?.permissions?.["masters"]?.edit;
  const canDelete = currentUser?.role === "admin" || currentUser?.permissions?.["masters"]?.delete;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({
      id: Math.random().toString(36).substr(2, 9),
      ...formData as Client
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

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clients Master</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your customer database and GST details.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)} className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
            <Plus size={20} className="mr-2" /> Add New Client
          </Button>
        )}
      </div>

      <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/20 p-8">
        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 ring-1 ring-slate-200/50">
          <Search className="text-slate-400 ml-2" size={20} />
          <input 
            placeholder="Search clients by name or email..." 
            className="bg-transparent border-none outline-none w-full text-slate-700 font-bold placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto -mx-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Address</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">GST Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filtered.map((client, idx) => (
                  <motion.tr 
                    key={client.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                          {client.name[0]}
                        </div>
                        <span className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-700">{client.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{client.phone}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs text-slate-500 font-bold truncate max-w-[200px] flex items-center gap-2">
                        <MapPin size={12} className="text-slate-300" /> {client.address}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border",
                        client.gstApplicable ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                      )}>
                        {client.gstApplicable ? `GST: ${client.gstNumber}` : "No GST"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>}
                        {canDelete && <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Users size={40} strokeWidth={1} />
                    </div>
                    <p className="text-slate-400 italic font-bold uppercase tracking-widest text-xs">No clients found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Client">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={14} /> Client Name
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
              <label className="text-sm font-black text-indigo-900 cursor-pointer uppercase tracking-wider">GST Applicable for this client</label>
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
              Save Client
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

// --- Items Master ---
export const ItemsMaster: React.FC = () => {
  const { items, categories, addItem, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<Item>>({
    type: "raw material",
    uom: "Nos",
    stock: 0,
    alertRequired: false,
    reorderThreshold: 10
  });

  const generateItemCode = () => {
    const prefix = "ITM-";
    const lastItem = items.length > 0 ? items[items.length - 1] : null;
    let nextNumber = 1;
    
    if (lastItem && lastItem.itemCode && lastItem.itemCode.startsWith(prefix)) {
      const lastNumber = parseInt(lastItem.itemCode.replace(prefix, ""), 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    } else if (items.length > 0) {
      nextNumber = items.length + 1;
    }
    
    return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
  };

  const handleOpenModal = () => {
    setFormData({
      ...formData,
      itemCode: generateItemCode()
    });
    setIsModalOpen(true);
  };

  const canCreate = currentUser?.role === "admin" || currentUser?.permissions?.["masters"]?.create;
  const canEdit = currentUser?.role === "admin" || currentUser?.permissions?.["masters"]?.edit;
  const canDelete = currentUser?.role === "admin" || currentUser?.permissions?.["masters"]?.delete;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      id: Math.random().toString(36).substr(2, 9),
      ...formData as Item
    });
    setIsModalOpen(false);
    setFormData({ type: "raw material", uom: "Nos", stock: 0, alertRequired: false, reorderThreshold: 10 });
  };

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Items Master</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your product catalog, pricing, and inventory levels.</p>
        </div>
        {canCreate && (
          <Button onClick={handleOpenModal} className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
            <Plus size={20} className="mr-2" /> Add New Item
          </Button>
        )}
      </div>

      <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/20 p-8">
        <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 ring-1 ring-slate-200/50">
          <Search className="text-slate-400 ml-2" size={20} />
          <input 
            placeholder="Search items by name or type..." 
            className="bg-transparent border-none outline-none w-full text-slate-700 font-bold placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 p-6 flex gap-6 items-center group relative overflow-hidden ring-1 ring-slate-200/50">
                  <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-indigo-500/5 rounded-full transition-transform group-hover:scale-150 duration-700" />
                  
                  <div className="w-28 h-28 rounded-3xl bg-slate-50 relative overflow-hidden shrink-0 border border-slate-100 shadow-inner group-hover:rotate-3 transition-transform duration-500">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={32} strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-xl backdrop-blur-md border",
                        item.type === "finish goods" ? "bg-indigo-600 text-white border-indigo-400" : "bg-white/90 text-slate-800 border-white"
                      )}>
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{item.itemCode}</p>
                        <h3 className="font-black text-slate-800 text-lg leading-tight truncate group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={16} /></button>}
                        {canDelete && <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Tags size={12} className="text-indigo-300" />
                      {categories.find(c => c.id === item.categoryId)?.name || "Uncategorized"} • {item.uom}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Selling Price</p>
                        <p className="text-base font-black text-slate-900">{formatCurrency(item.sellingRate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Current Stock</p>
                        <div className="flex items-center justify-end gap-1.5">
                          <p className={cn(
                            "text-base font-black",
                            (item.alertRequired && item.stock < (item.reorderThreshold || 0)) ? "text-rose-500" : "text-emerald-500"
                          )}>{item.stock}</p>
                          {item.alertRequired && item.stock < (item.reorderThreshold || 0) && (
                            <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Package size={48} strokeWidth={1} />
              </div>
              <p className="text-slate-400 italic font-bold uppercase tracking-widest text-xs">No items found in the catalog.</p>
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Item">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-48 h-48 rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:bg-white hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 shrink-0 overflow-hidden relative group">
              {formData.image ? (
                <img src={formData.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              ) : (
                <>
                  <Upload size={32} className="mb-3 group-hover:text-indigo-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-slate-600">Upload Image</span>
                </>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({...formData, image: reader.result as string});
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={14} /> Item Code
                  </label>
                  <Input required disabled value={formData.itemCode || ""} className="h-12 rounded-xl border-2 border-slate-100 bg-slate-50 font-black text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Box size={14} /> Item Name
                  </label>
                  <Input required value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Settings size={14} /> Item Type
                  </label>
                  <Select 
                    options={[
                      { label: "Raw Material", value: "raw material" },
                      { label: "Finish Goods", value: "finish goods" },
                      { label: "Consumables", value: "Consumables" },
                      { label: "Tools", value: "Tools" },
                    ]} 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as ItemType})}
                    className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Settings size={14} /> Unit of Measure
                  </label>
                  <Select 
                    required
                    options={UOM_LIST.map(u => ({ label: u, value: u }))} 
                    value={formData.uom || "Nos"}
                    onChange={e => setFormData({...formData, uom: e.target.value})}
                    className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Tags size={14} /> Category
              </label>
              <Select 
                options={[
                  { label: "Select Category", value: "" },
                  ...categories.map(c => ({ label: c.name, value: c.id }))
                ]} 
                value={formData.categoryId || ""}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Percent size={14} /> GST Percentage (%)
              </label>
              <Input type="number" required value={formData.gstPercentage || ""} onChange={e => setFormData({...formData, gstPercentage: Number(e.target.value)})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} /> Purchase Rate
              </label>
              <Input type="number" required value={formData.purchaseRate || ""} onChange={e => setFormData({...formData, purchaseRate: Number(e.target.value)})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-black text-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} /> Selling Rate
              </label>
              <Input type="number" required value={formData.sellingRate || ""} onChange={e => setFormData({...formData, sellingRate: Number(e.target.value)})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-black text-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Package size={14} /> Initial Stock Level
            </label>
            <Input type="number" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-black" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-5 bg-rose-50 rounded-2xl border border-rose-100 cursor-pointer group hover:bg-rose-100 transition-all" onClick={() => setFormData({...formData, alertRequired: !formData.alertRequired})}>
              <div className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                formData.alertRequired ? "bg-rose-600 border-rose-600 text-white" : "bg-white border-slate-200"
              )}>
                {formData.alertRequired && <Plus size={16} strokeWidth={4} />}
              </div>
              <label className="text-sm font-black text-rose-900 cursor-pointer uppercase tracking-wider">Enable Low Stock Alert</label>
            </div>
            
            <AnimatePresence>
              {formData.alertRequired && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={14} /> Reorder Threshold
                    </label>
                    <Input required type="number" value={formData.reorderThreshold || ""} onChange={e => setFormData({...formData, reorderThreshold: Number(e.target.value)})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-black" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="py-6 px-8 font-black uppercase tracking-widest border-2">Cancel</Button>
            <Button type="submit" className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
              Save Item
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

// --- Categories Master ---
export const CategoriesMaster: React.FC = () => {
  const { categories, addCategory, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");

  const canCreate = currentUser?.role === "admin" || currentUser?.permissions?.["masters"]?.create;
  const canDelete = currentUser?.role === "admin" || currentUser?.permissions?.["masters"]?.delete;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory({ id: Math.random().toString(36).substr(2, 9), name });
    setIsModalOpen(false);
    setName("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Categories</h1>
          <p className="text-slate-500 font-medium mt-1">Organize your items into logical groups.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)} className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
            <Plus size={20} className="mr-2" /> Add Category
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 flex items-center justify-between group hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200 transition-all duration-500 border-none ring-1 ring-slate-100 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 -mr-6 -mt-6 bg-indigo-500/5 rounded-full transition-transform group-hover:scale-150 duration-700" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <Tags size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{cat.name}</span>
                </div>
                {canDelete && (
                  <button className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all relative z-10">
                    <Trash2 size={18} />
                  </button>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Category">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Tags size={14} /> Category Name
            </label>
            <Input required value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold" />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="py-6 px-8 font-black uppercase tracking-widest border-2">Cancel</Button>
            <Button type="submit" className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
