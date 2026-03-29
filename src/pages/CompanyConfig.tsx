import React, { useState } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card } from "@/components/ui";
import { Settings, Building2, MapPin, Globe, CreditCard, Save, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const CompanyConfigPage: React.FC = () => {
  const { company, updateCompany } = useApp();
  const [formData, setFormData] = useState(company);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate saving delay
    setTimeout(() => {
      updateCompany(formData);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Company Configuration</h1>
          <p className="text-slate-500 font-medium mt-1">Set up your business identity and financial settings.</p>
        </div>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 font-bold text-sm shadow-lg shadow-emerald-100"
          >
            <CheckCircle2 size={18} /> Configuration Saved!
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-none ring-1 ring-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
              <Building2 size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">General Information</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Company Name" 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g. TAGLIO.ERP"
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold"
              />
              <Input 
                label="GST Number" 
                value={formData.gstNumber || ""} 
                onChange={e => setFormData({...formData, gstNumber: e.target.value})} 
                placeholder="e.g. 22AAAAA0000A1Z5"
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Business Address
              </label>
              <textarea 
                required 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                placeholder="Full registered address"
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px] resize-none font-bold text-slate-700"
              />
            </div>
          </div>
        </Card>

        <Card className="border-none ring-1 ring-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
              <CreditCard size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Financial Settings</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} /> Base Currency
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold appearance-none cursor-pointer"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Settings size={14} /> Default Tax Rate (%)
                </label>
                <Input 
                  type="number" 
                  placeholder="18"
                  className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold"
                />
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <Info className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                These settings will affect all future transactions including Sales Orders, Invoices, and Purchase Orders. Changing the currency will not convert existing transaction values.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isSaving}
            className={cn(
              "px-12 py-6 text-lg font-black shadow-xl transition-all active:scale-95",
              isSaving ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
            )}
          >
            {isSaving ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Settings size={24} />
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={24} /> Save Configuration
              </div>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
