
import React, { useState } from 'react';
import { AppState, Product, Purchase } from '../types';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

interface PurchasesProps {
  state: AppState;
  onSavePurchase: (purchase: Purchase) => void;
}

const Purchases: React.FC<PurchasesProps> = ({ state, onSavePurchase }) => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [supplierDetails, setSupplierDetails] = useState({ name: '', phone: '', invoiceNo: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'search' | 'newProduct'>('search');

  // حالة لإضافة منتج جديد يدوياً بالكامل
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    barcode: '',
    qty: 1,
    costPrice: 0,
    salePrice: 0
  });

  const addToPurchase = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? {...i, qty: i.qty + 1, total: (i.qty+1) * i.costPrice} : i));
    } else {
      setItems([...items, { 
        productId: product.id, 
        name: product.name, 
        qty: 1, 
        costPrice: product.costPrice, 
        salePrice: product.salePrice,
        total: product.costPrice 
      }]);
    }
    setSearch('');
    setShowSuggestions(false);
  };

  const handleBarcodeScan = (barcode: string) => {
    if (scannerTarget === 'search') {
      const product = state.products.find(p => p.barcode === barcode);
      if (product) {
        addToPurchase(product);
      } else {
        // إذا لم يجد المنتج، يفترض أنه منتج جديد ويضعه في خانة الباركود بالأسفل
        setNewProductForm(prev => ({ ...prev, barcode }));
        alert("هذا الباركود غير مسجل، تم وضعه في خانة 'منتج جديد'");
      }
    } else {
      setNewProductForm(prev => ({ ...prev, barcode }));
    }
  };

  const addNewProductToItems = () => {
    if (!newProductForm.name) return alert("يرجى إدخال اسم المنتج");
    const tempId = 'NEW-' + Math.random().toString(36).substr(2, 5);
    setItems([...items, {
      productId: tempId,
      isNew: true,
      name: newProductForm.name,
      barcode: newProductForm.barcode,
      qty: newProductForm.qty,
      costPrice: newProductForm.costPrice,
      salePrice: newProductForm.salePrice,
      total: newProductForm.qty * newProductForm.costPrice
    }]);
    setNewProductForm({ name: '', barcode: '', qty: 1, costPrice: 0, salePrice: 0 });
  };

  const updateItem = (id: string, field: string, val: any) => {
    setItems(items.map(i => {
      if (i.productId === id) {
        const updated = { ...i, [field]: val };
        updated.total = updated.qty * updated.costPrice;
        return updated;
      }
      return i;
    }));
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.productId !== id));

  const handleSave = () => {
    if (items.length === 0) return;
    if (!supplierDetails.name) return alert("يرجى إدخال اسم المورد أو المكتب");

    const total = items.reduce((s, i) => s + i.total, 0);
    const newPurchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNo: supplierDetails.invoiceNo || `PUR-${Date.now().toString().slice(-6)}`,
      supplier: supplierDetails.name,
      items,
      grandTotal: total,
      createdAt: Date.now()
    };
    onSavePurchase(newPurchase);
    setItems([]);
    setSupplierDetails({ name: '', phone: '', invoiceNo: '' });
    alert("تم تسجيل المشتريات بنجاح وتحديث المخزن سحابياً.");
  };

  const suggestions = state.products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  ).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo'] pb-20">
      {/* بيانات المورد */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
        <h2 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-2">
          <i className="fas fa-truck-loading text-blue-600"></i>
          بيانات المورد / المكتب
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <input placeholder="اسم المورد أو المكتب *" className="w-full p-3 bg-gray-50 rounded-xl border outline-none font-bold" value={supplierDetails.name} onChange={e => setSupplierDetails({...supplierDetails, name: e.target.value})} />
           <input placeholder="رقم الهاتف" className="w-full p-3 bg-gray-50 rounded-xl border outline-none" value={supplierDetails.phone} onChange={e => setSupplierDetails({...supplierDetails, phone: e.target.value})} />
           <input placeholder="رقم فاتورة المورد" className="w-full p-3 bg-gray-50 rounded-xl border outline-none" value={supplierDetails.invoiceNo} onChange={e => setSupplierDetails({...supplierDetails, invoiceNo: e.target.value})} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
           {/* بحث عن منتج موجود */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border relative">
              <h3 className="font-bold text-gray-700 mb-4">إضافة من المخزن الحالي</h3>
              <div className="flex gap-2">
                <input 
                  placeholder="ابحث باسم المنتج أو الباركود..." 
                  className="w-full p-3 bg-blue-50 rounded-xl border-none outline-none font-bold text-sm"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                />
                <button 
                  onClick={() => { setScannerTarget('search'); setScannerOpen(true); }}
                  className="p-3 bg-blue-600 text-white rounded-xl shadow-md"
                >
                  <i className="fas fa-camera"></i>
                </button>
              </div>
              {showSuggestions && search && (
                <div className="absolute top-full left-6 right-6 bg-white shadow-2xl rounded-xl mt-2 z-50 border overflow-hidden">
                  {suggestions.map(p => (
                    <button key={p.id} onClick={() => addToPurchase(p)} className="w-full text-right p-4 hover:bg-blue-50 border-b last:border-0 flex justify-between">
                      <span className="font-bold">{p.name}</span>
                      <span className="text-blue-600 font-bold">{p.costPrice} ج.م</span>
                    </button>
                  ))}
                </div>
              )}
           </div>

           {/* إضافة منتج جديد تماماً */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border">
              <h3 className="font-bold text-emerald-600 mb-4 flex items-center gap-2">
                <i className="fas fa-plus-circle"></i> صنف جديد غير مسجل
              </h3>
              <div className="space-y-3">
                <input placeholder="اسم المنتج الجديد" className="w-full p-3 bg-gray-50 rounded-xl border text-sm" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} />
                <div className="flex gap-2">
                  <input placeholder="الباركود" className="flex-1 p-3 bg-gray-50 rounded-xl border text-sm" value={newProductForm.barcode} onChange={e => setNewProductForm({...newProductForm, barcode: e.target.value})} />
                  <button 
                    onClick={() => { setScannerTarget('newProduct'); setScannerOpen(true); }}
                    className="p-3 bg-emerald-600 text-white rounded-xl"
                  >
                    <i className="fas fa-barcode"></i>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="سعر الجملة" className="p-3 bg-gray-50 rounded-xl border text-sm" value={newProductForm.costPrice || ''} onChange={e => setNewProductForm({...newProductForm, costPrice: Number(e.target.value)})} />
                  <input type="number" placeholder="سعر البيع" className="p-3 bg-gray-50 rounded-xl border text-sm" value={newProductForm.salePrice || ''} onChange={e => setNewProductForm({...newProductForm, salePrice: Number(e.target.value)})} />
                </div>
                <input type="number" placeholder="الكمية المستلمة" className="w-full p-3 bg-gray-50 rounded-xl border text-sm text-center font-bold" value={newProductForm.qty} onChange={e => setNewProductForm({...newProductForm, qty: Number(e.target.value)})} />
                <button onClick={addNewProductToItems} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">إضافة للقائمة</button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border flex flex-col">
           <div className="p-6 border-b flex justify-between items-center bg-gray-50">
             <h3 className="font-black text-gray-800">أصناف فاتورة المشتريات</h3>
             <span className="text-xs bg-gray-200 px-3 py-1 rounded-full font-bold">{items.length} صنف</span>
           </div>
           <div className="flex-1 overflow-x-auto min-h-[400px]">
             <table className="w-full text-right border-collapse">
               <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                 <tr>
                   <th className="p-4 border-b">المنتج</th>
                   <th className="p-4 border-b text-center">الكمية</th>
                   <th className="p-4 border-b text-center">الجملة</th>
                   <th className="p-4 border-b text-center">الإجمالي</th>
                   <th className="p-4 border-b"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {items.map(item => (
                   <tr key={item.productId} className="hover:bg-blue-50/30 transition-colors">
                     <td className="p-4 font-bold text-gray-800">
                       {item.name}
                       {item.isNew && <span className="block text-[8px] text-emerald-500 font-bold">(جديد)</span>}
                     </td>
                     <td className="p-4">
                       <input type="number" className="w-16 p-2 bg-white border rounded-lg text-center font-bold" value={item.qty} onChange={e => updateItem(item.productId, 'qty', parseInt(e.target.value) || 1)} />
                     </td>
                     <td className="p-4">
                       <input type="number" className="w-20 p-2 bg-white border rounded-lg text-center" value={item.costPrice} onChange={e => updateItem(item.productId, 'costPrice', parseFloat(e.target.value) || 0)} />
                     </td>
                     <td className="p-4 text-center font-black text-gray-900">{item.total.toLocaleString()}</td>
                     <td className="p-4 text-center">
                       <button onClick={() => removeItem(item.productId)} className="text-red-300 hover:text-red-500"><i className="fas fa-trash"></i></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="p-6 bg-gray-900 text-white rounded-b-3xl flex justify-between items-center">
             <div>
               <p className="text-[10px] opacity-60 font-bold">إجمالي الفاتورة</p>
               <h4 className="text-3xl font-black">{items.reduce((s,i) => s + i.total, 0).toLocaleString()} <span className="text-sm font-normal">ج.م</span></h4>
             </div>
             <button onClick={handleSave} disabled={items.length === 0} className="px-10 py-4 bg-blue-600 rounded-2xl font-black text-lg shadow-lg disabled:opacity-50">حفظ سحابياً</button>
           </div>
        </div>
      </div>

      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScan} />
    </div>
  );
};

export default Purchases;
