
import React from 'react';
import { AppState } from '../types';
import { exportToExcel } from '../utils/exportExcel';

interface ReportsProps {
  state: AppState;
}

const Reports: React.FC<ReportsProps> = ({ state }) => {
  const totalSales = state.sales.reduce((s, item) => s + item.grandTotal, 0);
  const totalExpenses = state.expenses.reduce((s, item) => s + item.amount, 0);
  
  const totalCOGS = state.sales.reduce((sum, s) => {
    return sum + s.items.reduce((itemSum, item) => {
      const prod = state.products.find(p => p.id === item.productId);
      return itemSum + (prod ? prod.costPrice * item.qty : 0);
    }, 0);
  }, 0);

  const repairRevenue = state.repairs.reduce((s, r) => s + r.totalCost, 0);
  const grossProfit = (totalSales - totalCOGS) + repairRevenue;
  const netProfit = grossProfit - totalExpenses;

  const handleExcelExport = () => {
    const formattedData = state.sales.map(s => ({
      "رقم الفاتورة": s.invoiceNo,
      "اسم العميل": s.customerName || "عميل نقدي",
      "الإجمالي": s.grandTotal,
      "طريقة الدفع": s.paymentMethod,
      "التاريخ": new Date(s.createdAt).toLocaleDateString('ar-EG'),
      "الوقت": new Date(s.createdAt).toLocaleTimeString('ar-EG')
    }));
    // Fix: exportToExcel expects an array of sections (with sheetName and data) and a filename as the second argument
    exportToExcel([{ sheetName: "المبيعات", data: formattedData }], "تقرير_المبيعات_الحسن");
  };

  const exportExpensesExcel = () => {
    const formattedData = state.expenses.map(e => ({
      "التصنيف": e.category,
      "المبلغ": e.amount,
      "ملاحظات": e.notes,
      "التاريخ": new Date(e.createdAt).toLocaleDateString('ar-EG')
    }));
    // Fix: exportToExcel expects an array of sections (with sheetName and data) and a filename as the second argument
    exportToExcel([{ sheetName: "المصاريف", data: formattedData }], "تقرير_المصاريف_الحسن");
  };

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo']">
      <div className="flex justify-between items-center mb-4">
         <h2 className="text-2xl font-black text-gray-800">التقارير المالية الاحترافية</h2>
         <div className="flex gap-2">
           <button onClick={handleExcelExport} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-green-700">
             <i className="fas fa-file-excel"></i> تصدير المبيعات
           </button>
           <button onClick={exportExpensesExcel} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-700">
             <i className="fas fa-file-excel"></i> تصدير المصاريف
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 rounded-3xl text-white shadow-xl">
           <p className="text-blue-100 text-sm mb-1">إجمالي إيراد المبيعات</p>
           <h3 className="text-3xl font-black">{totalSales.toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
           <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs opacity-80">
              <span>إجمالي الفواتير</span>
              <span>{state.sales.length} فاتورة</span>
           </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-3xl text-white shadow-xl">
           <p className="text-green-100 text-sm mb-1">مجمل الربح (البضاعة + الصيانة)</p>
           <h3 className="text-3xl font-black">{grossProfit.toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
           <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs opacity-80">
              <span>إيراد الصيانة</span>
              <span>{repairRevenue.toLocaleString()} ج.م</span>
           </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-3xl text-white shadow-xl">
           <p className="text-red-100 text-sm mb-1">صافي الربح النهائي</p>
           <h3 className="text-3xl font-black">{netProfit.toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3>
           <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs opacity-80">
              <span>المصاريف المسجلة</span>
              <span>{totalExpenses.toLocaleString()} ج.م</span>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h4 className="font-black text-gray-800 mb-6 flex items-center gap-2">
            <i className="fas fa-crown text-yellow-500"></i> الأكثر مبيعاً
          </h4>
          <div className="space-y-4">
             {state.products.sort((a,b) => b.stockQty - a.stockQty).slice(0, 5).map(p => (
               <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                 <span className="text-sm font-bold text-gray-700">{p.name}</span>
                 <span className="text-xs font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{p.stockQty} قطعة</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h4 className="font-black text-gray-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-500"></i> تحليل المصاريف
          </h4>
          <div className="space-y-5">
             {['إيجار', 'رواتب', 'كهرباء ومياه', 'تسويق', 'أخرى'].map(cat => {
               const catTotal = state.expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
               const percent = totalExpenses > 0 ? (catTotal / totalExpenses) * 100 : 0;
               return (
                 <div key={cat} className="space-y-2">
                   <div className="flex justify-between text-xs font-bold">
                     <span>{cat}</span>
                     <span className="text-red-600">{catTotal.toLocaleString()} ج.م</span>
                   </div>
                   <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                     <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
