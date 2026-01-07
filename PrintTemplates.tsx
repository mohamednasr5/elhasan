
import React from 'react';

export const PrintInvoice = ({ data, type, mode }: { data: any, type: 'sale' | 'repair' | 'report', mode: 'A4' | 'POS' }) => {
  const isPOS = mode === 'POS';
  
  if (type === 'report') {
    return (
      <div className="a4-invoice mx-auto text-slate-900 p-12 bg-white" dir="rtl">
        <div className="text-center mb-10 border-b-4 border-blue-600 pb-8">
          <h1 className="text-4xl font-black text-blue-800 mb-2">تقرير الأداء المالي</h1>
          <p className="text-lg font-bold text-slate-500">الحسن للهواتف - إدارة المبيعات والصيانة</p>
          <p className="text-sm font-black mt-2 bg-slate-100 w-fit mx-auto px-6 py-2 rounded-full">الفترة: {data.periodLabel}</p>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-3xl text-center"><p className="text-xs font-black text-blue-600 uppercase mb-2">إجمالي المبيعات</p><p className="text-2xl font-black">{(Number(data.totalSales) || 0).toLocaleString()} ج.م</p></div>
          <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-3xl text-center"><p className="text-xs font-black text-rose-600 uppercase mb-2">إجمالي المصروفات</p><p className="text-2xl font-black">{(Number(data.totalExpenses) || 0).toLocaleString()} ج.م</p></div>
          <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-center"><p className="text-xs font-black text-emerald-600 uppercase mb-2">صافي الأرباح</p><p className="text-3xl font-black text-emerald-700">{(Number(data.netProfit) || 0).toLocaleString()} ج.م</p></div>
        </div>
        <table className="w-full text-right border-collapse mb-10 border-2 border-slate-200">
          <thead><tr className="bg-slate-900 text-white"><th className="p-4 border">البند المالي</th><th className="p-4 border text-left">المبلغ</th></tr></thead>
          <tbody>
            <tr><td className="p-4 border font-bold">إيرادات المبيعات</td><td className="p-4 border text-left font-black">{(Number(data.totalSales) || 0).toLocaleString()} ج.م</td></tr>
            <tr><td className="p-4 border font-bold">إيرادات الصيانة</td><td className="p-4 border text-left font-black">{(Number(data.totalRepairRevenue) || 0).toLocaleString()} ج.م</td></tr>
            <tr><td className="p-4 border font-bold">تكلفة البضاعة المباعة (COGS)</td><td className="p-4 border text-left font-black text-rose-500">-{(Number(data.totalCOGS) || 0).toLocaleString()} ج.م</td></tr>
            <tr><td className="p-4 border font-bold">إجمالي المصروفات التشغيلية</td><td className="p-4 border text-left font-black text-rose-500">-{(Number(data.totalExpenses) || 0).toLocaleString()} ج.م</td></tr>
            <tr className="bg-slate-100"><td className="p-6 border text-xl font-black">صافي الأرباح النهائية</td><td className="p-6 border text-left text-3xl font-black text-emerald-700">{(Number(data.netProfit) || 0).toLocaleString()} ج.م</td></tr>
          </tbody>
        </table>
        <div className="mt-20 flex justify-between opacity-40 text-[10px] border-t pt-8"><span>تاريخ الاستخراج: {new Date().toLocaleString('ar-EG')}</span><span>نظام الحسن v3.0</span></div>
      </div>
    );
  }

  return (
    <div className={isPOS ? 'pos-receipt mx-auto text-slate-900' : 'a4-invoice mx-auto text-slate-900 border p-12'} dir="rtl">
      <div className="text-center mb-8 border-b-2 pb-6">
        <h1 className={`${isPOS ? 'text-2xl' : 'text-5xl'} font-black uppercase`}>الحسن للهواتف</h1>
        <p className="text-xs font-bold mt-2">شارع التحرير | هاتف: 01012345678</p>
      </div>
      <div className="flex justify-between mb-8 font-black text-sm">
        <div><p className="opacity-40 text-[10px]">العميل:</p><p className="text-lg">{data.customerName || 'عميل نقدي'}</p></div>
        <div className="text-left"><p className="opacity-40 text-[10px]">الفاتورة:</p><p className="text-lg">#{data.invoiceNo || data.ticketNo}</p></div>
      </div>
      <table className="w-full text-right border-collapse mb-10">
        <thead><tr className="border-y-2 border-slate-900 bg-slate-50"><th className="py-4">الصنف</th><th className="py-4 text-center">الكمية</th><th className="py-4 text-left">السعر</th></tr></thead>
        <tbody>
          {(data.items || []).map((item: any, idx: number) => (
            <tr key={idx} className="border-b"><td className="py-4 font-bold">{item.name}</td><td className="py-4 text-center">{item.qty}</td><td className="py-4 text-left font-black">{(Number(item.price) || 0).toLocaleString()}</td></tr>
          ))}
          {type === 'repair' && <tr className="border-b"><td className="py-4 font-bold">خدمة صيانة</td><td className="py-4 text-center">1</td><td className="py-4 text-left font-black">{(Number(data.totalCost) || 0).toLocaleString()}</td></tr>}
        </tbody>
      </table>
      <div className="flex justify-between items-center text-xl font-black border-t-2 border-slate-900 pt-6"><span>الإجمالي النهائي</span><span className="text-3xl">{(Number(data.grandTotal || data.totalCost) || 0).toLocaleString()} ج.م</span></div>
    </div>
  );
};
