
import React, { useState } from 'react';
import { UserRole } from './types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: UserRole;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'fa-house-chimney' },
    { id: 'pos', label: 'نقطة البيع', icon: 'fa-cash-register' },
    { id: 'purchases', label: 'المشتريات', icon: 'fa-cart-flatbed' },
    { id: 'repair', label: 'الصيانة', icon: 'fa-screwdriver-wrench' },
    { id: 'inventory', label: 'المخزن', icon: 'fa-box-open' },
    { id: 'expenses', label: 'المصروفات', icon: 'fa-file-invoice-dollar' },
    { id: 'reports', label: 'التقارير', icon: 'fa-chart-pie', admin: true },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-['Cairo'] text-slate-900 overflow-hidden">
      <header className="md:hidden bg-slate-900 text-white p-5 flex justify-between items-center z-[100] sticky top-0">
        <button onClick={() => setIsOpen(true)} className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl"><i className="fas fa-bars-staggered"></i></button>
        <h1 className="text-xl font-black tracking-tighter">AL-HASAN <span className="text-blue-500">POS</span></h1>
        <button onClick={onLogout} className="w-12 h-12 flex items-center justify-center bg-rose-500/20 text-rose-500 rounded-2xl"><i className="fas fa-power-off"></i></button>
      </header>

      <aside className={`fixed inset-y-0 right-0 z-[110] w-80 bg-slate-900 text-white shadow-2xl transition-transform duration-500 md:translate-x-0 md:static ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="mb-12 flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 text-2xl font-black">H</div>
            <div>
               <h1 className="text-xl font-black tracking-tighter">الحسن للهواتف</h1>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Management v3.0</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map(item => (
              (!item.admin || userRole === UserRole.ADMIN) && (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-[-4px]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <i className={`fas ${item.icon} text-lg w-8 ${activeTab === item.id ? 'text-white' : 'group-hover:text-blue-400'}`}></i>
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
             <div className="p-6 bg-white/5 rounded-[30px] text-center border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold mb-1">تطوير م/ محمد حماد</p>
                <a href="https://www.facebook.com/en.mohamed.nasr" target="_blank" className="text-xs font-black text-blue-500 hover:underline">EL-HASAN TECH</a>
                <button onClick={onLogout} className="w-full mt-6 py-3 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-xs hover:bg-rose-500 hover:text-white transition-all">تسجيل الخروج</button>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-12 overflow-y-auto h-screen no-scrollbar">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
