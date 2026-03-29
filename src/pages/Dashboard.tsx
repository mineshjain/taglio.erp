import React from "react";
import { useApp } from "@/AppContext";
import { Card, Badge } from "@/components/ui";
import { 
  TrendingUp, Users, ShoppingCart, Package, 
  ArrowUpRight, ArrowDownRight, DollarSign, 
  Clock, CheckCircle2, AlertCircle, Receipt, CreditCard,
  Calendar, ChevronRight, Activity
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, 
  PieChart, Pie, Cell 
} from "recharts";
import { motion } from "framer-motion";

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: number; 
  color: string;
  subtitle?: string;
  delay?: number;
}> = ({ title, value, icon: Icon, trend, color, subtitle, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
  >
    <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 border-none ring-1 ring-slate-100 h-full p-0">
      <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-700", color)} />
      <div className="p-8 flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{title}</p>
          <div className="space-y-1">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
            {subtitle && <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{subtitle}</p>}
          </div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full w-fit mt-4 uppercase tracking-widest shadow-sm",
              trend >= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
            )}>
              {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div className={cn("p-5 rounded-[1.5rem] shadow-2xl shadow-current/20 text-white transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500", color)}>
          <Icon size={28} strokeWidth={2.5} />
        </div>
      </div>
      <div className="h-1 w-full bg-slate-50 absolute bottom-0 left-0">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, delay: delay + 0.5 }}
          className={cn("h-full opacity-30", color)}
        />
      </div>
    </Card>
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const { leads, salesOrders, items, invoices, payments, clients, currentUser } = useApp();

  const canViewCrm = currentUser?.role === "admin" || currentUser?.permissions?.["crm"]?.view;
  const canViewSales = currentUser?.role === "admin" || currentUser?.permissions?.["sales"]?.view;
  const canViewInventory = currentUser?.role === "admin" || currentUser?.permissions?.["inventory"]?.view;
  const canViewBilling = currentUser?.role === "admin" || currentUser?.permissions?.["billing"]?.view;

  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const pendingOrders = salesOrders.filter(o => o.status === "Pending");
  const activeLeads = leads.filter(l => l.status !== "Closed Won" && l.status !== "Closed Lost");
  const lowStockItems = items.filter(i => i.stock < 10);
  const pendingInvoices = invoices.filter(i => {
    const paid = payments.filter(p => p.invoiceId === i.id).reduce((acc, p) => acc + p.amount, 0);
    return i.totalAmount - paid > 0;
  });

  const today = new Date().toISOString().split("T")[0];
  const todaysLeads = leads.filter(l => l.createdAt.split("T")[0] === today);

  // Mock chart data
  const revenueData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 2000 },
    { name: "Apr", value: 2780 },
    { name: "May", value: 1890 },
    { name: "Jun", value: 2390 },
    { name: "Jul", value: 3490 },
  ];

  return (
    <div className="space-y-12 pb-24">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Dashboard</h1>
            <Badge variant="primary" className="mt-2">v2.0 Beta</Badge>
          </div>
          <p className="text-slate-500 font-medium text-xl">
            Welcome back, <span className="text-indigo-600 font-black">{currentUser?.name}</span>. 
            <span className="hidden md:inline"> Here's your business performance summary.</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 ring-1 ring-slate-200/50">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <Calendar size={16} /> Last 30 Days
          </button>
          <button className="px-6 py-3 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl cursor-pointer transition-all flex items-center gap-2">
            All Time <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {canViewBilling && <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} trend={12.5} color="bg-indigo-600" subtitle="Total invoiced amount" delay={0.1} />}
        {canViewCrm && <StatCard title="Active Leads" value={activeLeads.length} icon={Users} trend={8.2} color="bg-violet-600" subtitle="Leads in pipeline" delay={0.2} />}
        {canViewSales && <StatCard title="Pending Orders" value={pendingOrders.length} icon={ShoppingCart} trend={-2.4} color="bg-pink-600" subtitle="Orders to be processed" delay={0.3} />}
        {canViewInventory && <StatCard title="Low Stock" value={lowStockItems.length} icon={Package} color="bg-emerald-600" subtitle="Items below threshold" delay={0.4} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card 
            title="Revenue Overview" 
            subtitle="Monthly revenue trends"
            icon={<Activity size={20} />}
            className="h-full"
          >
            <div className="h-[350px] w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                    tickFormatter={(value) => `₹${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' 
                    }}
                    itemStyle={{ fontWeight: 900, color: '#4f46e5' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-8">
          {canViewCrm && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              <Card title="Today's Leads" icon={<Users size={20} />} subtitle="New opportunities">
                <div className="space-y-4 mt-6">
                  {todaysLeads.length > 0 ? todaysLeads.map((lead, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + (idx * 0.1) }}
                      key={lead.id} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-3">
                          {lead.companyName[0]}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{lead.companyName}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{lead.contactPerson}</p>
                        </div>
                      </div>
                      <Badge variant="primary">{lead.status.split(' ')[0]}</Badge>
                    </motion.div>
                  )) : <div className="text-center py-12 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                      <Users className="mx-auto text-slate-200 mb-2" size={40} />
                      <p className="text-slate-400 font-bold italic text-sm">No new leads today.</p>
                    </div>}
                </div>
              </Card>
            </motion.div>
          )}

          {canViewInventory && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}>
              <Card title="Low Stock" icon={<Package size={20} />} subtitle="Action required">
                <div className="space-y-4 mt-6">
                  {lowStockItems.length > 0 ? lowStockItems.slice(0, 3).map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (idx * 0.1) }}
                      key={item.id} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/30 border border-rose-100 hover:bg-white hover:shadow-xl hover:shadow-rose-200/20 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 group-hover:scale-110">
                          <Package size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 group-hover:text-rose-600 transition-colors text-sm">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.stock} in stock</p>
                        </div>
                      </div>
                      <Badge variant="danger">Low</Badge>
                    </motion.div>
                  )) : <div className="text-center py-12 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                      <Package className="mx-auto text-slate-200 mb-2" size={40} />
                      <p className="text-slate-400 font-bold italic text-sm">Stock levels healthy.</p>
                    </div>}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {canViewSales && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Card title="Open Sales Orders" icon={<ShoppingCart size={20} />} subtitle="Awaiting fulfillment">
              <div className="space-y-4 mt-6">
                {pendingOrders.length > 0 ? pendingOrders.slice(0, 4).map((order, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + (idx * 0.1) }}
                    key={order.id} 
                    className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all duration-500 group-hover:-rotate-3">
                        <ShoppingCart size={28} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 group-hover:text-pink-600 transition-colors">#{order.id.toUpperCase()}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{clients.find(c => c.id === order.clientId)?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                      <Badge variant="warning">{order.status}</Badge>
                    </div>
                  </motion.div>
                )) : <div className="text-center py-12 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                    <ShoppingCart className="mx-auto text-slate-200 mb-2" size={48} />
                    <p className="text-slate-400 font-bold italic">No open orders.</p>
                  </div>}
              </div>
            </Card>
          </motion.div>
        )}

        {canViewBilling && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Card title="Pending Invoices" icon={<Receipt size={20} />} subtitle="Awaiting payment">
              <div className="space-y-4 mt-6">
                {pendingInvoices.length > 0 ? pendingInvoices.slice(0, 4).map((inv, idx) => {
                  const paid = payments.filter(p => p.invoiceId === inv.id).reduce((acc, p) => acc + p.amount, 0);
                  const balance = inv.totalAmount - paid;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (idx * 0.1) }}
                      key={inv.id} 
                      className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                          <Receipt size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">#{inv.id.toUpperCase()}</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{clients.find(c => c.id === inv.clientId)?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-rose-600">{formatCurrency(balance)}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Due: {formatDate(inv.dueDate)}</p>
                      </div>
                    </motion.div>
                  );
                }) : <div className="text-center py-12 bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                    <Receipt className="mx-auto text-slate-200 mb-2" size={48} />
                    <p className="text-slate-400 font-bold italic">No pending invoices.</p>
                  </div>}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {canViewBilling && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card title="Recent Collections" icon={<CreditCard size={20} />} subtitle="Latest payments received">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {payments.slice(-3).reverse().map((p, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + (idx * 0.1) }}
                  key={p.id} 
                  className="p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 flex items-center gap-6 hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 group"
                >
                  <div className="w-20 h-20 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <CreditCard size={40} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.25em] mb-2">{p.method}</p>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{formatCurrency(p.amount)}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{formatDate(p.date)}</p>
                  </div>
                </motion.div>
              ))}
              {payments.length === 0 && <p className="col-span-3 text-center py-12 text-slate-400 font-bold italic bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">No payments recorded yet.</p>}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: any }> = ({ status }) => {
  const colors: Record<string, string> = {
    "New": "bg-blue-100 text-blue-700",
    "Contacted": "bg-indigo-100 text-indigo-700",
    "Qualified": "bg-violet-100 text-violet-700",
    "Proposal": "bg-pink-100 text-pink-700",
    "Negotiation": "bg-amber-100 text-amber-700",
    "Closed Won": "bg-emerald-100 text-emerald-700",
    "Closed Lost": "bg-rose-100 text-rose-700",
  };

  return (
    <span className={cn("text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full shadow-sm", colors[status] || "bg-slate-100 text-slate-700")}>
      {status}
    </span>
  );
};

