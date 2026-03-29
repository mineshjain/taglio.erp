import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, UserCheck, Package, Tags, Settings, 
  TrendingUp, Calculator, FileText, ShoppingCart, 
  Warehouse, Receipt, CreditCard, Menu, X, ChevronRight,
  BarChart3, Truck, Bell, RefreshCw, ArrowRightLeft,
  LogOut, Search, User, ChevronDown
} from "lucide-react";
import { cn } from "./lib/utils";
import { useApp } from "./AppContext";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "crm", label: "Leads & CRM", icon: TrendingUp, path: "/leads" },
  { id: "sales", label: "Cost Estimation", icon: Calculator, path: "/estimation" },
  { id: "sales", label: "Quotes", icon: FileText, path: "/quotes" },
  { id: "sales", label: "Sales Orders", icon: ShoppingCart, path: "/orders" },
  { id: "inventory", label: "Inventory", icon: Warehouse, path: "/inventory", subItems: [
    { label: "Dashboard", icon: Warehouse, path: "/inventory" },
    { label: "Purchase Orders", icon: Truck, path: "/inventory/purchases" },
    { label: "GRN", icon: Truck, path: "/inventory/grn" },
    { label: "Material Issue", icon: FileText, path: "/inventory/issue" },
    { label: "Material Return", icon: RefreshCw, path: "/inventory/return" },
    { label: "Stock Adjustment", icon: Settings, path: "/inventory/adjustment" },
    { label: "Stock Transfer", icon: ArrowRightLeft, path: "/inventory/transfer" },
  ]},
  { id: "billing", label: "Invoices", icon: Receipt, path: "/invoices" },
  { id: "billing", label: "Payments", icon: CreditCard, path: "/payments" },
  { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
  { id: "masters", label: "Masters", icon: Settings, path: "/masters", subItems: [
    { label: "Clients", icon: UserCheck, path: "/masters/clients" },
    { label: "Suppliers", icon: Users, path: "/masters/suppliers" },
    { label: "Categories", icon: Tags, path: "/masters/categories" },
    { label: "Items", icon: Package, path: "/masters/items" },
    { label: "Users", icon: Users, path: "/masters/users" },
    { label: "Company", icon: Settings, path: "/masters/company" },
  ]},
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const location = useLocation();
  const { items, currentUser } = useApp();

  const lowStockItemsCount = items.filter(i => i.alertRequired && i.stock < (i.reorderThreshold || 0)).length;

  const hasPermission = (moduleId: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (moduleId === 'dashboard') return true;
    return currentUser.permissions?.[moduleId]?.view === true;
  };

  const visibleNavItems = navItems.filter(item => hasPermission(item.id));

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">T</div>
          <span className="font-black text-slate-900 tracking-tighter text-lg">TAGLIO.ERP</span>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('inventory') && (
            <Link to="/inventory" className="relative p-2.5 text-slate-500 hover:text-indigo-600 transition-all bg-slate-50 rounded-xl border border-slate-100">
              <Bell size={20} />
              {lowStockItemsCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
              )}
            </Link>
          )}
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Sidebar / Drawer */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:relative md:bg-transparent md:inset-auto md:block transition-all duration-500",
              !isSidebarOpen && "hidden md:block"
            )}
          >
            <div className={cn(
              "w-80 h-full bg-white md:bg-white/70 md:backdrop-blur-2xl border-r border-slate-200/60 flex flex-col shadow-2xl md:shadow-none transition-all duration-500",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-200 rotate-3">T</div>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-xl tracking-tighter leading-none">TAGLIO</span>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1">Enterprise ERP</span>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="px-8 mb-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    placeholder="Quick Search..." 
                    className="w-full pl-11 pr-4 py-3 bg-slate-100/50 border border-slate-200/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-1.5 custom-scrollbar">
                {visibleNavItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.subItems && item.subItems.some(sub => location.pathname === sub.path));
                  const isExpanded = expandedItem === item.id || (item.subItems && item.subItems.some(sub => location.pathname === sub.path));

                  return (
                    <div key={item.id} className="space-y-1">
                      <div 
                        onClick={() => item.subItems ? toggleExpand(item.id) : null}
                        className="relative"
                      >
                        <Link
                          to={item.subItems ? "#" : item.path}
                          onClick={(e) => {
                            if (item.subItems) {
                              e.preventDefault();
                            } else {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                            isActive 
                              ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" 
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(
                            isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500 transition-colors"
                          )} />
                          <span className={cn("font-black uppercase tracking-widest text-[11px]", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900")}>
                            {item.label}
                          </span>
                          
                          {item.label === "Inventory" && lowStockItemsCount > 0 && (
                            <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                              {lowStockItemsCount}
                            </span>
                          )}
                          
                          {item.subItems && (
                            <ChevronDown size={16} className={cn(
                              "ml-auto transition-transform duration-300",
                              isExpanded ? "rotate-180" : ""
                            )} />
                          )}
                        </Link>
                      </div>
                      
                      <AnimatePresence>
                        {item.subItems && isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-6 my-2 space-y-1 border-l-2 border-slate-100 pl-4">
                              {item.subItems.map(sub => {
                                const isSubActive = location.pathname === sub.path;
                                return (
                                  <Link
                                    key={sub.path}
                                    to={sub.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group",
                                      isSubActive 
                                        ? "text-indigo-600 bg-indigo-50" 
                                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                                    )}
                                  >
                                    <sub.icon size={16} strokeWidth={isSubActive ? 2.5 : 2} className={cn(
                                      isSubActive ? "text-indigo-600" : "text-slate-300 group-hover:text-indigo-400"
                                    )} />
                                    <span>{sub.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              <div className="p-8 border-t border-slate-100 bg-white/50">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500 font-black text-lg shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-3">
                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{currentUser?.name || 'User Account'}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{currentUser?.role || 'Guest Access'}</p>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar relative z-10">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around py-3 px-6 sticky bottom-0 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          {visibleNavItems.slice(0, 4).map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.id} 
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300",
                  isActive ? "text-indigo-600 bg-indigo-50 px-4" : "text-slate-400"
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center gap-1.5 p-2 text-slate-400"
          >
            <Menu size={22} />
            <span className="text-[9px] font-black uppercase tracking-widest">More</span>
          </button>
        </nav>
      </main>
    </div>
  );
};
