
import React from 'react';
import { AppState } from '../types';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  
  // حسابات اليوم فقط
  const todaySales = state.sales.filter(s => s.createdAt >= startOfToday);
  const todayExpenses = state.expenses.filter(e => e.createdAt >= startOfToday);
  const todayRepairs = state.repairs.filter(r => r.receivedDate >= startOfToday);
  
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
  const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayRepairsRevenue = todayRepairs.reduce((sum, r) => sum + r.totalCost, 0);

  const todayCOGS = todaySales.reduce((sum, s) => {
    return sum + (s.items ? s.items.reduce((iSum, item) => {
      const prod = state.products.find(p => p.id === item.productId);
      return iSum + (prod ? prod.costPrice * item.qty : 0);
    }, 0) : 0);
  }, 0);

  const todayProfit = (todaySalesTotal - todayCOGS) + todayRepairsRevenue - todayExpensesTotal;

  // إحصائيات عامة
  const inventoryValue = state.products.reduce((sum, p) => sum + (p.costPrice * p.stockQty), 0);

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo'] pb-10">
      {/* نبض اليوم */}
      <div className="bg-gradient-to-l from-blue-700 to-blue-900 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
          <div className="border-l border-white/20 pl-4 text-center md:text-right">
             <p className="text-blue-100 text-xs font-bold uppercase mb-1">أرباح اليوم (صافي)</p>
             <h3 className="text-4xl font-black">{todayProfit.toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
          </div>
          <div className="border-l border-white/20 pl-4 text-center md:text-right">
             <p className="text-blue-100 text-xs font-bold uppercase mb-1">مبيعات اليوم</p>
             <h3 className="text-2xl font-black">{todaySalesTotal.toLocaleString()} ج.م</h3>
          </div>
          <div className="border-l border-white/20 pl-4 text-center md:text-right">
             <p className="text-blue-100 text-xs font-bold uppercase mb-1">مصاريف اليوم</p>
             <h3 className="text-2xl font-black">{todayExpensesTotal.toLocaleString()} ج.م</h3>
          </div>
          <div className="text-center md:text-right">
             <p className="text-blue-100 text-xs font-bold uppercase mb-1">أجهزة مستلمة</p>
             <h3 className="text-2xl font-black">{todayRepairs.length} جهاز</h3>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* قيمة المخزن */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-indigo-50 flex items-center gap-6">
           <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
             <i className="fas fa-vault"></i>
           </div>
           <div>
             <p className="text-gray-400 text-xs font-bold uppercase mb-1">سيولة في بضاعة</p>
             <h3 className="text-2xl font-black text-indigo-900">{inventoryValue.toLocaleString()} <span className="text-xs font-normal">ج.م</span></h3>
           </div>
        </div>

        {/* الصيانة */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-orange-50 flex items-center gap-6">
           <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
             <i className="fas fa-screwdriver-wrench"></i>
           </div>
           <div>
             <p className="text-gray-400 text-xs font-bold uppercase mb-1">أجهزة قيد العمل</p>
             <h3 className="text-2xl font-black text-orange-900">{state.repairs.filter(r => r.status !== 'Delivered' && r.status !== 'Canceled').length} جهاز</h3>
           </div>
        </div>

        {/* النواقص */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-rose-50 flex items-center gap-6">
           <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
             <i className="fas fa-layer-group"></i>
           </div>
           <div>
             <p className="text-gray-400 text-xs font-bold uppercase mb-1">نواقص عاجلة</p>
             <h3 className="text-2xl font-black text-rose-900">{state.products.filter(p => p.stockQty <= p.minStockAlert).length} صنف</h3>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border overflow-hidden">
           <h4 className="font-black text-gray-800 mb-6 flex items-center gap-2">
             <i className="fas fa-clock-rotate-left text-blue-600"></i> آخر حركات البيع
           </h4>
           <div className="space-y-4">
             {state.sales.slice(-5).reverse().map(sale => (
               <div key={sale.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-blue-100">
                 <div>
                   <span className="text-[10px] font-bold text-blue-500">{sale.invoiceNo}</span>
                   <p className="text-sm font-black text-gray-800">{sale.customerName || 'عميل نقدي'}</p>
                 </div>
                 <div className="text-left">
                   <p className="font-black text-blue-700">{sale.grandTotal.toLocaleString()} ج.م</p>
                   <span className="text-[9px] text-gray-400">{new Date(sale.createdAt).toLocaleTimeString('ar-EG')}</span>
                 </div>
               </div>
             ))}
             {state.sales.length === 0 && <p className="text-center py-10 text-gray-400 italic font-bold">لا مبيعات حتى الآن</p>}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border overflow-hidden">
           <h4 className="font-black text-rose-600 mb-6 flex items-center gap-2">
             <i className="fas fa-triangle-exclamation"></i> أصناف قاربت على النفاذ
           </h4>
           <div className="space-y-3">
             {state.products.filter(p => p.stockQty <= p.minStockAlert).slice(0, 6).map(p => (
               <div key={p.id} className="p-4 bg-rose-50 rounded-2xl flex justify-between items-center border border-rose-100">
                 <span className="text-sm font-black text-gray-700">{p.name}</span>
                 <span className="text-xs font-black text-white bg-rose-600 px-4 py-1 rounded-full">{p.stockQty} قطع</span>
               </div>
             ))}
             {state.products.filter(p => p.stockQty <= p.minStockAlert).length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <i className="fas fa-check-circle text-5xl text-emerald-500"></i>
                  <p className="text-emerald-600 font-black">المخزن في حالة ممتازة!</p>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
