import React, { useState } from "react";
import { useApp } from "@/AppContext";
import { Button, Input, Card, Modal, Select } from "@/components/ui";
import { Plus, Search, Edit2, Trash2, UserCheck, Shield, Lock, Mail, Server, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { User, ModulePermissions, SmtpConfig } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const MODULES = [
  { id: "crm", label: "CRM" },
  { id: "sales", label: "Sales" },
  { id: "purchases", label: "Purchases" },
  { id: "inventory", label: "Inventory" },
  { id: "billing", label: "Billing" },
  { id: "masters", label: "Masters" },
  { id: "reports", label: "Reports" },
];

const DEFAULT_PERMISSIONS: Record<string, ModulePermissions> = MODULES.reduce((acc, mod) => {
  acc[mod.id] = { view: false, create: false, edit: false, delete: false, export: false };
  return acc;
}, {} as Record<string, ModulePermissions>);

export const UsersMaster: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<User>>({
    role: "staff",
    permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)),
    smtpConfig: { host: "", port: 587, username: "", password: "", secure: false }
  });

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      ...user,
      permissions: user.permissions || JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)),
      smtpConfig: user.smtpConfig || { host: "", port: 587, username: "", password: "", secure: false }
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(id);
    }
  };

  const handlePermissionChange = (module: string, action: keyof ModulePermissions, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...(prev.permissions?.[module] || { view: false, create: false, edit: false, delete: false, export: false }),
          [action]: value
        }
      }
    }));
  };

  const handleSmtpChange = (field: keyof SmtpConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      smtpConfig: {
        ...(prev.smtpConfig || { host: "", port: 587, username: "", password: "", secure: false }),
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      updateUser(editingUserId, formData);
    } else {
      addUser({
        id: Math.random().toString(36).substr(2, 9),
        ...formData as User
      });
    }
    setIsModalOpen(false);
    setEditingUserId(null);
    setFormData({ 
      role: "staff", 
      permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)),
      smtpConfig: { host: "", port: 587, username: "", password: "", secure: false }
    });
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Users Master</h1>
          <p className="text-slate-500 font-medium">Manage system users and access roles.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto shadow-lg shadow-indigo-200">
          <Plus size={20} className="mr-2" /> Add New User
        </Button>
      </div>

      <Card className="border-none ring-1 ring-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="text-slate-400 ml-2" size={20} />
            <input 
              placeholder="Search users by name or email..." 
              className="bg-transparent border-none outline-none w-full text-slate-700 font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role & Access</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filtered.map((user, idx) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-100">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className={cn(
                            user.role === "admin" ? "text-rose-500" : user.role === "manager" ? "text-amber-500" : "text-slate-400"
                          )} />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                            user.role === "admin" ? "bg-rose-100 text-rose-700" : user.role === "manager" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                          )}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {Object.values(user.permissions || {}).filter((p: any) => p.view).length} Modules Active
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(user)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Edit User"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-400 italic font-medium">No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingUserId(null); }} 
        title={editingUserId ? "Edit User Account" : "Create New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">
          {/* Basic Info Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <UserCheck size={18} />
              <h3 className="text-sm font-black uppercase tracking-wider">Account Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" required value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
              <Input label="Email Address" type="email" required value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@company.com" />
            </div>
            <Select 
              label="System Role" 
              options={[
                { label: "Administrator (Full Access)", value: "admin" },
                { label: "Manager (Limited Admin)", value: "manager" },
                { label: "Staff (Standard Access)", value: "staff" },
              ]} 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as any})}
            />
          </section>

          {/* Permissions Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Lock size={18} />
              <h3 className="text-sm font-black uppercase tracking-wider">Module Permissions</h3>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/50 border-b border-slate-200">
                    <th className="p-3 font-black text-slate-500 uppercase tracking-wider">Module</th>
                    <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-center">View</th>
                    <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-center">Create</th>
                    <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-center">Edit</th>
                    <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-center">Delete</th>
                    <th className="p-3 font-black text-slate-500 uppercase tracking-wider text-center">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {MODULES.map(mod => (
                    <tr key={mod.id} className="hover:bg-white transition-colors">
                      <td className="p-3 font-bold text-slate-700">{mod.label}</td>
                      {(['view', 'create', 'edit', 'delete', 'export'] as const).map(action => (
                        <td key={action} className="p-3 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={formData.permissions?.[mod.id]?.[action] || false}
                              onChange={e => handlePermissionChange(mod.id, action, e.target.checked)}
                            />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SMTP Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Mail size={18} />
              <h3 className="text-sm font-black uppercase tracking-wider">Email (SMTP) Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="SMTP Host" value={formData.smtpConfig?.host || ""} onChange={e => handleSmtpChange('host', e.target.value)} placeholder="smtp.gmail.com" />
              <Input label="SMTP Port" type="number" value={formData.smtpConfig?.port || ""} onChange={e => handleSmtpChange('port', Number(e.target.value))} placeholder="587" />
              <Input label="SMTP Username" value={formData.smtpConfig?.username || ""} onChange={e => handleSmtpChange('username', e.target.value)} placeholder="user@example.com" />
              <Input label="SMTP Password" type="password" value={formData.smtpConfig?.password || ""} onChange={e => handleSmtpChange('password', e.target.value)} placeholder="********" />
            </div>
            <div 
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                formData.smtpConfig?.secure ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-100"
              )}
              onClick={() => handleSmtpChange('secure', !formData.smtpConfig?.secure)}
            >
              <div className="flex items-center gap-3">
                <Server className={formData.smtpConfig?.secure ? "text-indigo-600" : "text-slate-400"} size={20} />
                <div>
                  <p className="text-sm font-bold text-slate-800">Secure Connection (TLS/SSL)</p>
                  <p className="text-xs text-slate-500 font-medium">Encrypt email communications</p>
                </div>
              </div>
              {formData.smtpConfig?.secure ? <CheckCircle2 className="text-indigo-600" /> : <XCircle className="text-slate-300" />}
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-white border-t border-slate-100 mt-8 pb-2">
            <Button variant="outline" type="button" onClick={() => { setIsModalOpen(false); setEditingUserId(null); }} className="px-8">Cancel</Button>
            <Button type="submit" className="px-8 shadow-lg shadow-indigo-200">{editingUserId ? "Update Account" : "Create Account"}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
