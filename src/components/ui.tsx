import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronDown, Check, Info } from "lucide-react";

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" }> = ({ 
  className, variant = "primary", ...props 
}) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 active:scale-95",
    outline: "border-2 border-slate-100 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-200 active:scale-95",
    ghost: "text-slate-600 hover:bg-slate-100 active:scale-95",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95",
  };

  return (
    <button 
      className={cn(
        "px-5 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base select-none",
        variants[variant],
        className
      )} 
      {...props} 
    />
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; icon?: React.ReactNode }> = ({ 
  className, label, error, icon, ...props 
}) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <input 
          className={cn(
            "w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400 font-bold text-sm md:text-base",
            icon && "pl-11",
            error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
            className
          )} 
          {...props} 
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1"
        >
          <Info size={12} /> {error}
        </motion.p>
      )}
    </div>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; options: { label: string; value: string }[] }> = ({ 
  className, label, error, options, ...props 
}) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select 
          className={cn(
            "w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-sm md:text-base appearance-none cursor-pointer",
            error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
            className
          )} 
          {...props}
        >
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { title?: string; subtitle?: string; action?: React.ReactNode; icon?: React.ReactNode }> = ({ 
  className, title, subtitle, action, icon, children, ...props 
}) => {
  return (
    <div className={cn("bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden", className)} {...props}>
      {(title || action) && (
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="font-black text-slate-800 text-lg tracking-tight uppercase tracking-wider">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-8">{children}</div>
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: "primary" | "success" | "warning" | "danger" | "neutral"; className?: string }> = ({ 
  children, variant = "neutral", className 
}) => {
  const variants = {
    primary: "bg-indigo-50 text-indigo-600 border-indigo-100",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    danger: "bg-rose-50 text-rose-600 border-rose-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; maxWidth?: string }> = ({ 
  isOpen, onClose, title, children, maxWidth = "max-w-2xl"
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn("bg-white rounded-[2.5rem] w-full shadow-2xl overflow-hidden relative z-10", maxWidth)}
          >
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-wider">{title}</h3>
              <button 
                onClick={onClose} 
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-90"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Combobox: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
  className?: string;
}> = ({ label, value, onChange, options, placeholder, required, disabled, allowCustom, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showCustom = allowCustom && searchTerm && !options.some(opt => opt.label.toLowerCase() === searchTerm.toLowerCase());

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={cn("space-y-2 w-full relative", className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div 
        className={cn(
          "w-full px-4 py-3 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 flex items-center justify-between cursor-pointer transition-all font-bold text-sm md:text-base",
          disabled && "opacity-50 cursor-not-allowed bg-slate-100",
          isOpen && "ring-4 ring-indigo-500/10 border-indigo-500 bg-white",
          !disabled && "hover:border-slate-200"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={cn("truncate", !value && "text-slate-400 font-medium")}>
          {value || placeholder || "Select..."}
        </span>
        <ChevronDown size={18} className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[110] top-full left-0 right-0 mt-3 bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
              <Search size={18} className="text-slate-400 ml-2" />
              <input
                autoFocus
                className="w-full bg-transparent border-none outline-none py-2 text-sm font-bold placeholder:text-slate-400"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && showCustom) {
                    handleSelect(searchTerm);
                  }
                }}
              />
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <div
                    key={opt.value}
                    className={cn(
                      "px-5 py-3 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-between transition-all mb-1 last:mb-0",
                      value === opt.value ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-700 hover:bg-slate-50"
                    )}
                    onClick={() => handleSelect(opt.value)}
                  >
                    {opt.label}
                    {value === opt.value && <Check size={16} />}
                  </div>
                ))
              ) : !showCustom && (
                <div className="px-5 py-10 text-center text-slate-400 text-sm font-bold italic">
                  No results found
                </div>
              )}
              
              {showCustom && (
                <div
                  className="px-5 py-3 rounded-xl text-sm font-black text-indigo-600 cursor-pointer hover:bg-indigo-50 transition-colors border-2 border-dashed border-indigo-100 mt-2 flex items-center justify-center gap-2"
                  onClick={() => handleSelect(searchTerm)}
                >
                  Add "{searchTerm}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
