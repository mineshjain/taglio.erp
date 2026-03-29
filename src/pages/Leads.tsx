import React, { useState } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { 
  Plus, Search, TrendingUp, Filter, 
  MoreVertical, Mail, Phone, Calendar, 
  MessageSquare, ChevronRight, FileSpreadsheet, 
  CheckCircle2, Clock, AlertCircle, UserPlus,
  Edit2, Trash2, Upload, LayoutGrid, List as ListIcon,
  ArrowRight, DollarSign, Building2, User
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Lead, LeadStatus } from "@/types";
import { motion, AnimatePresence } from "motion/react";

const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  const colors = {
    "New": "bg-blue-100 text-blue-700 border-blue-200",
    "Contacted": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Qualified": "bg-violet-100 text-violet-700 border-violet-200",
    "Proposal": "bg-pink-100 text-pink-700 border-pink-200",
    "Negotiation": "bg-amber-100 text-amber-700 border-amber-200",
    "Closed Won": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Closed Lost": "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <span className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border", colors[status])}>
      {status}
    </span>
  );
};

export const LeadsPage: React.FC = () => {
  const { leads, addLead, updateLeadStatus } = useApp();
  const [view, setView] = useState<"list" | "pipeline">("pipeline");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<Lead>>({
    status: "New",
    value: 0,
    notes: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...formData as Lead
    });
    setIsModalOpen(false);
    setFormData({ status: "New", value: 0, notes: [] });
  };

  const handleImport = () => {
    // Mock import logic
    const mockLeads: Lead[] = [
      { id: "imp1", companyName: "TechCorp Solutions", contactPerson: "Alice Smith", email: "alice@techcorp.com", phone: "9876543210", status: "New", value: 50000, createdAt: new Date().toISOString(), notes: [] },
      { id: "imp2", companyName: "Global Logistics", contactPerson: "Bob Johnson", email: "bob@global.com", phone: "9876543211", status: "New", value: 120000, createdAt: new Date().toISOString(), notes: [] },
    ];
    mockLeads.forEach(addLead);
    setIsImportModalOpen(false);
  };

  const filtered = leads.filter(l => 
    l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Leads & CRM</h1>
          <p className="text-slate-500 font-medium mt-1">Track opportunities and manage customer relationships.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="py-6 px-6 font-black uppercase tracking-widest border-2">
            <FileSpreadsheet size={20} className="mr-2" /> Import Excel
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
            <UserPlus size={20} className="mr-2" /> Add New Lead
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm ring-1 ring-slate-200/50">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setView("pipeline")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", 
              view === "pipeline" ? "bg-white text-indigo-600 shadow-xl shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutGrid size={16} /> Pipeline
          </button>
          <button 
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all", 
              view === "list" ? "bg-white text-indigo-600 shadow-xl shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <ListIcon size={16} /> List View
          </button>
        </div>
        <div className="flex items-center gap-3 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              placeholder="Search leads..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-2">
            <Filter size={20} />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "pipeline" ? (
          <motion.div 
            key="pipeline"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[700px] -mx-4 px-4"
          >
            {statuses.map((status, sIdx) => (
              <div key={status} className="flex-shrink-0 w-80 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">{status}</h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-lg">
                      {leads.filter(l => l.status === status).length}
                    </span>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {formatCurrency(leads.filter(l => l.status === status).reduce((acc, l) => acc + l.value, 0))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {leads.filter(l => l.status === status).map((lead, idx) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 border-none ring-1 ring-slate-100 group cursor-grab active:cursor-grabbing relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-indigo-500/5 rounded-full transition-transform group-hover:scale-125 duration-700" />
                          
                          <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-3">
                              {lead.companyName[0]}
                            </div>
                            <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                          
                          <h4 className="font-black text-slate-800 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{lead.companyName}</h4>
                          <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">{lead.contactPerson}</p>
                          
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Phone size={14} className="text-indigo-400" />
                              <span className="text-xs font-bold">{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar size={14} className="text-indigo-400" />
                              <span className="text-xs font-bold">{formatDate(lead.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-50 relative z-10">
                            <p className="text-lg font-black text-slate-900">{formatCurrency(lead.value)}</p>
                            <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                                {lead.contactPerson.split(' ').map(n => n[0]).join('')}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {leads.filter(l => l.status === status).length === 0 && (
                    <div className="h-40 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300 gap-2">
                      <TrendingUp size={32} strokeWidth={1} className="opacity-20" />
                      <p className="italic font-bold text-xs uppercase tracking-widest">No leads here</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-none ring-1 ring-slate-100 shadow-2xl shadow-slate-200/30 p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Company</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Value</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Created</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {filtered.map((lead, idx) => (
                        <motion.tr 
                          key={lead.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                                {lead.companyName[0]}
                              </div>
                              <span className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{lead.companyName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-sm font-black text-slate-700">{lead.contactPerson}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lead.email}</p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-lg font-black text-slate-900">{formatCurrency(lead.value)}</p>
                          </td>
                          <td className="px-8 py-5">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-xs text-slate-500 font-black uppercase tracking-wider">{formatDate(lead.createdAt)}</p>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><MessageSquare size={18} /></button>
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Lead">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} /> Company Name
              </label>
              <Input required value={formData.companyName || ""} onChange={e => setFormData({...formData, companyName: e.target.value})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Contact Person
              </label>
              <Input required value={formData.contactPerson || ""} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold" />
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} /> Pipeline Status
              </label>
              <Select 
                options={statuses.map(s => ({ label: s, value: s }))} 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as LeadStatus})}
                className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14} /> Estimated Deal Value
              </label>
              <Input type="number" required value={formData.value || ""} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="h-12 rounded-xl border-2 border-slate-100 focus:border-indigo-500 transition-all font-black text-lg" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="py-6 px-8 font-black uppercase tracking-widest border-2">Cancel</Button>
            <Button type="submit" className="py-6 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200">
              Create Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Leads from Excel">
        <div className="space-y-8 text-center py-8 p-2">
          <div className="w-28 h-28 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100 shadow-xl shadow-emerald-100">
            <FileSpreadsheet size={48} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Select Excel File</h3>
            <p className="text-slate-500 font-medium mt-1">Upload your lead database in .xlsx or .csv format.</p>
          </div>
          <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 hover:bg-white hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer group">
            <Upload className="mx-auto text-slate-200 group-hover:text-indigo-500 transition-all duration-500 mb-4" size={48} strokeWidth={2.5} />
            <p className="text-sm font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">Drag and drop file here or click to browse</p>
          </div>
          <div className="flex justify-center gap-3 pt-6">
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)} className="py-6 px-8 font-black uppercase tracking-widest border-2">Cancel</Button>
            <Button onClick={handleImport} className="py-6 px-8 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200">
              Simulate Import
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
