
import React, { useState } from 'react';
import { AppState, Product, Purchase } from './types';
import BarcodeScannerModal from './BarcodeScannerModal';

const Purchases: React.FC<{state: AppState, onSavePurchase: (p: Purchase) => void}> = ({ state, onSavePurchase }) => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [supplierDetails, setSupplierDetails] = useState({ name: '', phone: '', invoiceNo: '' });
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [newProductForm, setNewProductForm] = useState({ name: '', barcode: '', qty: 1, costPrice: 0, salePrice: 0 });

  const addToPurchase = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? {...i, qty: i.qty + 1, total: (i.qty+1) * i.costPrice} : i));
    } else {
      setItems([...items, { productId: product.id, name: product.name, qty: 1, costPrice: product.costPrice, salePrice: product.salePrice, total: product.costPrice }]);
    }
    setSearch('');
  };

  const handleBarcodeScan = (barcode: string) => {
    const product = state.products.find(p => p.barcode === barcode);
    if (product) {
      addToPurchase(product);
    } else {
      setNewProductForm(prev => ({ ...prev, barcode }));
      alert("الباركود غير مسجل، تم وضعه في خانة الصنف الجديد");
    }
  };

  const handleSave = () => {
    if (items.length === 0 || !supplierDetails.name) return alert("يرجى إدخال اسم المورد وأصناف الفاتورة");
    onSavePurchase({ 
      id: Date.now().toString(), 
      items, 
      grandTotal: items.reduce((s,i) => s + i.total, 0), 
      createdAt: Date.now(), 
      ...supplierDetails 
    } as any);
    setItems([]);
    setSupplierDetails({ name: '', phone: '', invoiceNo: '' });
  };

  return (
    <div className="space-y-6 font-['Cairo'] pb-20 animate-fade-in">
      <div className="bg-white p-8 rounded-[40px] border shadow-sm">
        <h2 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-2"><i className="fas fa-truck-loading"></i> بيانات المورد</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <input placeholder="اسم المورد *" className="p-4 bg-gray-50 rounded-2xl border outline-none font-bold" value={supplierDetails.name} onChange={e => setSupplierDetails({...supplierDetails, name: e.target.value})} />
           <input placeholder="رقم الفاتورة" className="p-4 bg-gray-50 rounded-2xl border outline-none" value={supplierDetails.invoiceNo} onChange={e => setSupplierDetails({...supplierDetails, invoiceNo: e.target.value})} />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <h3 className="font-black mb-4 text-gray-700">إضافة من المخزن</h3>
              <div className="flex gap-2">
                <input placeholder="البحث بالاسم..." className="w-full p-3 bg-blue-50 rounded-xl border-none outline-none font-bold" value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={() => setScannerOpen(true)} className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg"><i className="fas fa-camera"></i></button>
              </div>
           </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-[40px] border shadow-sm flex flex-col min-h-[500px]">
           <div className="p-8 border-b font-black text-lg text-gray-800 flex justify-between">أصناف الفاتورة <span>{items.length} صنف</span></div>
           <div className="flex-1 p-8 overflow-y-auto">
              {items.map(i => (
                <div key={i.productId} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl mb-3 border border-transparent hover:border-blue-100 transition-all">
                   <div className="text-right"><p className="font-black">{i.name}</p><p className="text-[10px] text-gray-400 font-bold">QTY: {i.qty}</p></div>
                   <span className="font-black text-blue-700">{i.total.toLocaleString()} ج.م</span>
                </div>
              ))}
           </div>
           <div className="p-8 border-t flex justify-between items-center bg-gray-900 text-white rounded-b-[40px]">
              <div><h4 className="text-3xl font-black">{items.reduce((s,i) => s + i.total, 0).toLocaleString()} ج.م</h4></div>
              <button onClick={handleSave} className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-2xl">حفظ سحابياً</button>
           </div>
        </div>
      </div>
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScan} />
    </div>
  );
};

export default Purchases;
