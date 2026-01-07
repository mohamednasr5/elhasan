
import React from 'react';

export const PrintInvoice = ({ data, type, mode }: { data: any, type: 'sale' | 'repair' | 'report', mode: 'A4' | 'POS' }) => {
  const isPOS = mode === 'POS';
  
  if (type === 'report') {
    return (
      <div className="a4-invoice mx-auto text-slate-900 p-12 bg-white" dir="rtl">
        <div className="text-center mb-10 border-b-4 border-blue-600 pb-8">
          <h1 className="text-4xl font-black text-blue-800 mb-2">تقرير الأداء المالي</h1>
          <p className="text-lg font-bold text-slate-500">الحسن للهواتف - إدارة الصيانة والمبيعات</p>
          <p className="text-sm font-black mt-2 bg-slate-100 w-fit mx-auto px-6 py-2 rounded-full">الفترة: {data.periodLabel}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-3xl text-center">
            <p className="text-xs font-black text-blue-600 uppercase mb-2">إجمالي المبيعات</p>
            <p className="text-2xl font-black">{data.totalSales.toLocaleString()} ج.م</p>
          </div>
          <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-3xl text-center">
            <p className="text-xs font-black text-rose-600 uppercase mb-2">إجمالي المصروفات</p>
            <p className="text-2xl font-black">{data.totalExpenses.toLocaleString()} ج.م</p>
          </div>
          <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-3xl text-center">
            <p className="text-xs font-black text-emerald-600 uppercase mb-2">صافي الأرباح</p>
            <p className="text-3xl font-black text-emerald-700">{data.netProfit.toLocaleString()} ج.م</p>
          </div>
        </div>

        <h3 className="text-xl font-black mb-4 border-r-4 border-blue-600 pr-4">ملخص العمليات</h3>
        <table className="w-full text-right border-collapse mb-10 border-2 border-slate-200">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-4 border">البند</th>
              <th className="p-4 border">التفاصيل</th>
              <th className="p-4 border text-left">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4 border font-bold">المبيعات الإجمالية</td>
              <td className="p-4 border text-slate-500">إيرادات بيع المنتجات والإكسسوارات</td>
              <td className="p-4 border text-left font-black text-blue-600">{data.totalSales.toLocaleString()} ج.م</td>
            </tr>
            <tr>
              <td className="p-4 border font-bold">إيرادات الصيانة</td>
              <td className="p-4 border text-slate-500">أجور فنية وخدمات إصلاح</td>
              <td className="p-4 border text-left font-black text-emerald-600">{data.totalRepairRevenue.toLocaleString()} ج.م</td>
            </tr>
            <tr>
              <td className="p-4 border font-bold">تكلفة البضاعة المباعة</td>
              <td className="p-4 border text-slate-500">سعر جملة المنتجات التي تم بيعها</td>
              <td className="p-4 border text-left font-black text-rose-400">-{data.totalCOGS.toLocaleString()} ج.م</td>
            </tr>
            <tr>
              <td className="p-4 border font-bold">المصروفات التشغيلية</td>
              <td className="p-4 border text-slate-500">إيجار، رواتب، فواتير، نثرية</td>
              <td className="p-4 border text-left font-black text-rose-600">-{data.totalExpenses.toLocaleString()} ج.م</td>
            </tr>
            <tr className="bg-slate-50">
              <td colSpan={2} className="p-6 border text-xl font-black text-slate-900">صافي الأرباح القابلة للسحب</td>
              <td className="p-6 border text-left text-3xl font-black text-emerald-700">{data.netProfit.toLocaleString()} ج.م</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-20 flex justify-between items-center opacity-40 text-[10px] font-black uppercase tracking-widest border-t pt-8">
          <span>تم استخراج التقرير بتاريخ: {new Date().toLocaleString('ar-EG')}</span>
          <span>نظام الحسن للإدارة v3.0</span>
        </div>
      </div>
    );
  }

  return (
    <div className={isPOS ? 'pos-receipt mx-auto text-slate-900' : 'a4-invoice mx-auto text-slate-900 shadow-xl border p-20'} dir="rtl">
      <div className="text-center mb-10 border-b-2 border-slate-900 pb-8">
        <h1 className={`${isPOS ? 'text-2xl' : 'text-5xl'} font-black tracking-tighter mb-2 uppercase`}>الحسن للهواتف</h1>
        <p className="text-xs font-bold opacity-60">بيع وصيانة كافة أنواع الهواتف والإكسسوارات</p>
        <p className="text-xs font-black mt-2 text-blue-600">القاهرة - شارع التحرير | هاتف: 01012345678</p>
      </div>

      <div className="flex justify-between mb-8 px-4 font-black text-sm">
        <div>
           <p className="opacity-40 uppercase text-[10px] mb-1">بيانات العميل</p>
           <p className="text-lg">{data.customerName || 'عميل نقدي'}</p>
           {data.customerPhone && <p className="text-xs opacity-60">{data.customerPhone}</p>}
        </div>
        <div className="text-left">
           <p className="opacity-40 uppercase text-[10px] mb-1">بيانات الفاتورة</p>
           <p className="text-lg">#{data.invoiceNo || data.ticketNo}</p>
           <p className="text-xs opacity-60">{new Date(data.createdAt || data.receivedDate || Date.now()).toLocaleDateString('ar-EG')}</p>
        </div>
      </div>

      <table className="w-full text-right border-collapse mb-10">
        <thead>
          <tr className="border-y-2 border-slate-900 bg-slate-50">
            <th className="py-4 px-2">الصنف</th>
            <th className="py-4 px-2 text-center">الكمية</th>
            <th className="py-4 px-2 text-left">السعر</th>
          </tr>
        </thead>
        <tbody>
          {(data.items || data.partsUsed || []).map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-slate-100">
              <td className="py-4 px-2 font-bold">{item.name}</td>
              <td className="py-4 px-2 text-center">{item.qty}</td>
              <td className="py-4 px-2 text-left font-black">{(Number(item.price) || 0).toLocaleString()}</td>
            </tr>
          ))}
          {type === 'repair' && (
            <tr className="border-b border-slate-100">
              <td className="py-4 px-2 font-bold">خدمة صيانة ومصنعية</td>
              <td className="py-4 px-2 text-center">1</td>
              <td className="py-4 px-2 text-left font-black">{(Number(data.totalCost) - (data.partsUsed?.reduce((s:any,i:any)=>s+(Number(i.total)||0), 0) || 0)).toLocaleString()}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="space-y-3 px-4">
        <div className="flex justify-between items-center text-xl font-black border-t-2 border-slate-900 pt-6">
           <span>الإجمالي النهائي</span>
           <span className="text-3xl">{(Number(data.grandTotal || data.totalCost) || 0).toLocaleString()} <span className="text-sm">ج.م</span></span>
        </div>
        {data.deposit > 0 && (
          <div className="flex justify-between items-center text-lg font-black text-rose-600 bg-rose-50 p-4 rounded-xl">
             <span>المتبقي للدفع</span>
             <span>{(Number(data.totalCost) - Number(data.deposit)).toLocaleString()} ج.م</span>
          </div>
        )}
      </div>

      <div className="mt-20 text-center border-t border-slate-100 pt-10">
        <p className="font-black opacity-60 text-sm italic">شكراً لثقتكم بنا</p>
        <p className="text-[8px] font-bold mt-10 opacity-30">AL-HASAN POS SYSTEM V3.0 - POWERED BY TECH</p>
      </div>
    </div>
  );
};
