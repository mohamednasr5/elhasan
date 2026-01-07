
import React, { useState } from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: UserRole;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'fa-chart-line' },
    { id: 'pos', label: 'فاتورة بيع', icon: 'fa-cash-register' },
    { id: 'purchases', label: 'المشتريات', icon: 'fa-shopping-cart' },
    { id: 'repair', label: 'الصيانة', icon: 'fa-tools' },
    { id: 'inventory', label: 'المخزن', icon: 'fa-box-open' },
    { id: 'expenses', label: 'المصاريف', icon: 'fa-file-invoice-dollar' },
    { id: 'reports', label: 'التقارير', icon: 'fa-file-chart-column', adminOnly: true },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 font-['Cairo']">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-blue-700 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(true)}>
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h1 className="text-xl font-bold">الحسن للهواتف</h1>
        <button onClick={onLogout}><i className="fas fa-sign-out-alt"></i></button>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl transition-transform transform md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b bg-blue-700 text-white">
          <h1 className="text-xl font-bold">الحسن لصيانة الهواتف</h1>
          <p className="text-[10px] opacity-75 mt-1">نظام الإدارة المتكامل</p>
        </div>
        
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
          {navItems.map(item => (
            (!item.adminOnly || userRole === UserRole.ADMIN) && (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50'}
                `}
              >
                <i className={`fas ${item.icon} w-6`}></i>
                <span className="text-sm">{item.label}</span>
              </button>
            )
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 mb-1">تطوير وبرمجة</p>
            <a href="https://www.facebook.com/en.mohamed.nasr" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline">المهندس محمد حماد</a>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto pb-20 md:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
