
import React, { useState, useMemo } from 'react';
import { AppState } from './types';
import { exportToExcel } from './exportExcel';
import { PrintInvoice } from './PrintTemplates';
import ReactDOM from 'react-dom/client';

const Reports: React.FC<{state: AppState}> = ({ state }) => {
  const [filter, setFilter] = useState('today'); // today, week, month, all
  
  const filteredData = useMemo(() => {
    let start = new Date();
    start.setHours(0,0,0,0);
    
    if (filter === 'week') start.setDate(start.getDate() - 7);
    else if (filter === 'month') start.setDate(1);
    else if (filter === 'all') start.setFullYear(2020);

    const startTime = start.getTime();

    const fSales = state.sales.filter(s => (s.createdAt || 0) >= startTime);
    const fExpenses = state.expenses.filter(e => (e.createdAt || 0) >= startTime);
    const fRepairs = state.repairs.filter(r => (r.receivedDate || 0) >= startTime);

    const totalSales = fSales.reduce((s, x) => s + (Number(x.grandTotal) || 0), 0);
    const totalRepairs = fRepairs.reduce((s, x) => s + (Number(x.totalCost) || 0), 0);
    const totalExpenses = fExpenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);

    const totalCOGS = fSales.reduce((sum, sale) => {
      return sum + (sale.items || []).reduce((itemSum, item) => {
        const product = state.products.find(p => p.id === item.productId);
        const cost = Number(item.costPrice || product?.costPrice || 0);
        return itemSum + (cost * (Number(item.qty) || 0));
      }, 0);
    }, 0);

    const netProfit = (totalSales - totalCOGS) + totalRepairs - totalExpenses;

    return { totalSales, totalRepairs, totalExpenses, totalCOGS, netProfit, fSales, fExpenses, fRepairs };
  }, [state, filter]);

  const handlePrint = () => {
    const data = { 
      periodLabel: filter === 'today' ? 'اليوم' : filter === 'week' ? 'آخر أسبوع' : filter === 'month' ? 'هذا الشهر' : 'الكل', 
      totalSales: filteredData.totalSales, 
      totalRepairRevenue: filteredData.totalRepairs, 
      totalCOGS: filteredData.totalCOGS, 
      totalExpenses: filteredData.totalExpenses, 
      netProfit: filteredData.netProfit 
    };
    const root = ReactDOM.createRoot(document.getElementById('print-section')!);
    root.render(<PrintInvoice data={data} type="report" mode="A4" />);
    setTimeout(() => window.print(), 500);
  };

  const handleExcel = () => {
    const data = filteredData.fSales.map(s => ({ 
      التاريخ: new Date(s.createdAt).toLocaleDateString('ar-EG'), 
      الفاتورة: s.invoiceNo, 
      العميل: s.customerName || 'عميل نقدي', 
      الإجمالي: (Number(s.grandTotal) || 0) 
    }));
    exportToExcel([{ sheetName: "المبيعات", data }], `تقرير_الحسن_${filter}`);
  };

  return (
    <div className="space-y-8 animate-fade-in font-['Cairo'] pb-24">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
        <div><h2 className="text-3xl font-black text-slate-900">التقارير المالية</h2><p className="text-slate-400 font-bold">تحليل الأرباح والمصاريف</p></div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
           {['today', 'week', 'month', 'all'].map(f => (
             <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
               {f === 'today' ? 'اليوم' : f === 'week' ? 'أسبوع' : f === 'month' ? 'شهر' : 'الكل'}
             </button>
           ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border shadow-sm"><p className="text-slate-400 text-xs font-black mb-1 uppercase tracking-widest">إجمالي المبيعات</p><h3 className="text-3xl font-black text-blue-600">{(filteredData.totalSales || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3></div>
        <div className="bg-white p-8 rounded-[40px] border shadow-sm"><p className="text-slate-400 text-xs font-black mb-1 uppercase tracking-widest">تكلفة البضاعة</p><h3 className="text-3xl font-black text-slate-800">{(filteredData.totalCOGS || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3></div>
        <div className="bg-white p-8 rounded-[40px] border shadow-sm"><p className="text-slate-400 text-xs font-black mb-1 uppercase tracking-widest">إجمالي المصروفات</p><h3 className="text-3xl font-black text-rose-600">{(filteredData.totalExpenses || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3></div>
        <div className={`p-8 rounded-[40px] shadow-2xl text-white transition-all transform hover:scale-105 ${filteredData.netProfit >= 0 ? 'bg-slate-900' : 'bg-rose-700'}`}><p className="opacity-60 text-xs font-black mb-1 uppercase tracking-widest">صافي الربح النهائي</p><h3 className="text-4xl font-black">{(filteredData.netProfit || 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></h3></div>
      </div>
      <div className="flex gap-4"><button onClick={handlePrint} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"><i className="fas fa-print"></i> طباعة التقرير</button><button onClick={handleExcel} className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"><i className="fas fa-file-excel"></i> تصدير Excel</button></div>
    </div>
  );
};

export default Reports;
