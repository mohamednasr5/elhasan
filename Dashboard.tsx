
import React from 'react';
import { AppState } from './types';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  
  const todaySales = state.sales.filter(s => (s.createdAt || 0) >= startOfToday);
  const todayExpenses = state.expenses.filter(e => (e.createdAt || 0) >= startOfToday);
  const todayRepairs = state.repairs.filter(r => (r.receivedDate || 0) >= startOfToday);
  
  const salesTotal = todaySales.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);
  const repairsTotal = todayRepairs.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
  const expensesTotal = todayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  const inventoryValue = state.products.reduce((sum, p) => sum + ((Number(p.costPrice) || 0) * (Number(p.stockQty) || 0)), 0);

  return (
    <div className="space-y-8 animate-fade-in font-['Cairo'] pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">نظرة عامة</h2>
          <p className="text-slate-400 font-bold mt-1">إحصائيات اليوم: {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm group hover:bg-blue-600 transition-all duration-500">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-all"><i className="fas fa-hand-holding-dollar text-2xl"></i></div>
          <p className="text-slate-400 font-black text-xs uppercase group-hover:text-blue-100">إيراد المبيعات</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2 group-hover:text-white">{(salesTotal || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
        </div>

        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm group hover:bg-emerald-600 transition-all duration-500">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-all"><i className="fas fa-screwdriver-wrench text-2xl"></i></div>
          <p className="text-slate-400 font-black text-xs uppercase group-hover:text-emerald-100">إيراد الصيانة</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2 group-hover:text-white">{(repairsTotal || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
        </div>

        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm group hover:bg-rose-600 transition-all duration-500">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 group-hover:text-white transition-all"><i className="fas fa-receipt text-2xl"></i></div>
          <p className="text-slate-400 font-black text-xs uppercase group-hover:text-rose-100">المصروفات</p>
          <h3 className="text-3xl font-black text-slate-900 mt-2 group-hover:text-white">{(expensesTotal || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
        </div>

        <div className="bg-slate-900 p-8 rounded-[35px] shadow-2xl text-white">
          <div className="w-14 h-14 bg-white/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6"><i className="fas fa-vault text-2xl"></i></div>
          <p className="text-slate-500 font-black text-xs uppercase">رأس مال المخزن</p>
          <h3 className="text-3xl font-black text-white mt-2">{(inventoryValue || 0).toLocaleString()} <span className="text-sm font-normal opacity-50">ج.م</span></h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-xl text-slate-800 flex items-center gap-3"><i className="fas fa-history text-blue-600"></i> آخر العمليات</h4>
          </div>
          <div className="space-y-4">
             {state.sales.slice(-5).reverse().map(sale => (
               <div key={sale.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-[28px] hover:bg-white transition-all">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 border shadow-sm"><i className="fas fa-file-invoice"></i></div>
                   <div>
                     <p className="font-black text-slate-800 text-sm">{sale.customerName || 'عميل نقدي'}</p>
                     <span className="text-[10px] text-slate-400 font-bold">{new Date(sale.createdAt || Date.now()).toLocaleTimeString('ar-EG')}</span>
                   </div>
                 </div>
                 <div className="text-left font-black text-slate-900 text-lg">{(Number(sale.grandTotal) || 0).toLocaleString()} <span className="text-[10px] font-normal opacity-50">ج.م</span></div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-xl text-slate-800 flex items-center gap-3"><i className="fas fa-tools text-emerald-600"></i> الصيانة الجارية</h4>
          </div>
          <div className="space-y-4">
             {state.repairs.filter(r => r.status !== 'تم التسليم للعميل').slice(-5).reverse().map(repair => (
               <div key={repair.id} className="p-5 bg-slate-50 rounded-[28px] flex justify-between items-center">
                 <div>
                   <p className="font-black text-slate-800 text-sm">{repair.deviceModel}</p>
                   <span className="text-[10px] text-emerald-600 font-bold">{repair.status}</span>
                 </div>
                 <div className="text-left font-black text-slate-900 text-sm">{(Number(repair.totalCost) || 0).toLocaleString()} ج.م</div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
