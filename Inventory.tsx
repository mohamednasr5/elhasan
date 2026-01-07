
import React, { useState } from 'react';
import { AppState, Product } from './types';
import BarcodeScannerModal from './BarcodeScannerModal';

const Inventory: React.FC<{state: AppState}> = ({ state }) => {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Partial<Product> | null>(null);
  const [isScannerOpen, setScannerOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    const fdb = window.db_firebase;
    if(!fdb) return;

    const productData = {
      name: modal?.name || '',
      barcode: modal?.barcode || '',
      category: modal?.category || 'عام',
      brand: modal?.brand || 'بدون ماركة',
      costPrice: Number(modal?.costPrice || 0),
      salePrice: Number(modal?.salePrice || 0),
      stockQty: Number(modal?.stockQty || 0),
      minStockAlert: Number(modal?.minStockAlert || 2),
      updatedAt: Date.now()
    };

    if(modal?.id) {
      fdb.ref(`products/${modal.id}`).update(productData);
    } else {
      fdb.ref('products').push(productData);
    }
    setModal(null);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm("⚠️ هل أنت متأكد من حذف هذا المنتج نهائياً من المخزن والسحابة؟")) {
      // @ts-ignore
      const fdb = window.db_firebase;
      fdb.ref(`products/${productId}`).remove();
      setModal(null);
    }
  };

  const filtered = state.products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode?.includes(search)
  );

  return (
    <div className="space-y-6 font-['Cairo'] animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">المخزن</h2>
          <p className="text-slate-400 font-bold">إدارة الأصناف والكميات</p>
        </div>
        <button onClick={() => setModal({stockQty: 0, costPrice: 0, salePrice: 0, minStockAlert: 2, category: 'عام', brand: 'عام'})} className="px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black shadow-lg hover:scale-105 transition-all">إضافة صنف جديد</button>
      </div>

      <div className="flex gap-2">
        <input placeholder="ابحث بالاسم أو الباركود..." className="flex-1 p-5 bg-white rounded-[24px] shadow-sm outline-none font-bold" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => setScannerOpen(true)} className="w-16 h-16 bg-slate-900 text-white rounded-[24px] shadow-lg flex items-center justify-center text-xl"><i className="fas fa-barcode"></i></button>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase border-b">
            <tr>
              <th className="p-6">الصنف</th>
              <th className="p-6">التصنيف</th>
              <th className="p-6 text-center">المخزون</th>
              <th className="p-6 text-center">سعر البيع</th>
              <th className="p-6 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-blue-50/30 transition-all">
                <td className="p-6">
                  <span className="font-black text-slate-800 block">{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest">{p.barcode || 'بدون باركود'}</span>
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">{p.category}</span>
                </td>
                <td className="p-6 text-center font-black">{(Number(p.stockQty) || 0)}</td>
                <td className="p-6 text-center font-black text-blue-700 text-xl">{(Number(p.salePrice) || 0).toLocaleString()} ج.م</td>
                <td className="p-6 text-center">
                  <button onClick={() => setModal(p)} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-edit"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
           <form onSubmit={handleSave} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black">{modal.id ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</h3>
                 <button type="button" onClick={() => setModal(null)} className="text-2xl opacity-50 hover:opacity-100"><i className="fas fa-times"></i></button>
              </div>
              <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-blue-600 outline-none" placeholder="اسم المنتج" value={modal.name || ''} onChange={e => setModal({...modal, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="التصنيف" value={modal.category || ''} onChange={e => setModal({...modal, category: e.target.value})} />
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="الماركة" value={modal.brand || ''} onChange={e => setModal({...modal, brand: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none text-rose-600" type="number" placeholder="سعر التكلفة" value={modal.costPrice} onChange={e => setModal({...modal, costPrice: Number(e.target.value)})} required />
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none text-blue-600" type="number" placeholder="سعر البيع" value={modal.salePrice} onChange={e => setModal({...modal, salePrice: Number(e.target.value)})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" type="number" placeholder="الكمية" value={modal.stockQty} onChange={e => setModal({...modal, stockQty: Number(e.target.value)})} required />
                  <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" type="number" placeholder="حد التنبيه" value={modal.minStockAlert} onChange={e => setModal({...modal, minStockAlert: Number(e.target.value)})} />
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="الباركود" value={modal.barcode || ''} onChange={e => setModal({...modal, barcode: e.target.value})} />
                  <button type="button" onClick={() => setScannerOpen(true)} className="w-14 h-14 bg-slate-100 rounded-2xl text-slate-600"><i className="fas fa-camera"></i></button>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black text-lg">حفظ البيانات</button>
                  {modal.id && (
                    <button type="button" onClick={() => handleDelete(modal.id!)} className="px-8 py-5 bg-rose-50 text-rose-600 rounded-3xl font-black hover:bg-rose-600 hover:text-white transition-all"><i className="fas fa-trash"></i> مسح المنتج</button>
                  )}
                </div>
              </div>
           </form>
        </div>
      )}
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScan={b => { setModal(prev => ({...prev, barcode: b})); setScannerOpen(false); }} />
    </div>
  );
};

export default Inventory;
