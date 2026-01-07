
import React, { useState } from 'react';
import { AppState, Product } from '../types';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

interface InventoryProps {
  state: AppState;
  onUpdateProducts: (products: Product[]) => void;
  onDeleteProduct: (productId: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ state, onUpdateProducts, onDeleteProduct }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<'search' | 'edit'>('search');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const fdb = (window as any).firebase.database();
    const productData = {
      name: editingProduct.name,
      barcode: editingProduct.barcode || '',
      cost: Number(editingProduct.costPrice),
      salePrice: Number(editingProduct.salePrice),
      qty: Number(editingProduct.stockQty),
      minStock: Number(editingProduct.minStockAlert) || 1,
      brand: editingProduct.brand || 'عام',
      category: editingProduct.category || 'عام'
    };

    if (editingProduct.id) {
      fdb.ref(`products/${editingProduct.id}`).update(productData);
    } else {
      fdb.ref('products').push(productData);
    }

    setModalOpen(false);
    setEditingProduct(null);
  };

  const confirmDelete = (productId: string) => {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا المنتج نهائياً من قاعدة البيانات السحابية؟')) {
      onDeleteProduct(productId);
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    if (scannerTarget === 'search') {
      setSearchTerm(barcode);
    } else {
      setEditingProduct(prev => ({ ...prev, barcode }));
    }
  };

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-fade-in font-['Cairo'] pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96 flex gap-2">
           <div className="relative flex-1">
              <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو الباركود..."
                className="w-full pr-12 py-4 bg-white rounded-3xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 border-none font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button 
            onClick={() => { setScannerTarget('search'); setScannerOpen(true); }}
            className="p-4 bg-white text-blue-600 rounded-3xl shadow-sm hover:bg-blue-50 transition-all"
           >
             <i className="fas fa-camera text-xl"></i>
           </button>
        </div>
        <button 
          onClick={() => { setEditingProduct({ stockQty: 0, costPrice: 0, salePrice: 0 }); setModalOpen(true); }}
          className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-3xl font-black shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <i className="fas fa-plus"></i> إضافة صنف جديد
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="p-6">المنتج</th>
                <th className="p-6 text-center">المخزون</th>
                <th className="p-6 text-center">التكلفة</th>
                <th className="p-6 text-center">البيع</th>
                <th className="p-6 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/50 transition-all">
                  <td className="p-6">
                    <p className="font-black text-gray-800 text-lg">{p.name}</p>
                    <p className="text-[10px] text-blue-500 font-bold">باركود: {p.barcode || 'غير مسجل'}</p>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-2 rounded-2xl font-black text-sm ${p.stockQty <= p.minStockAlert ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {p.stockQty}
                    </span>
                  </td>
                  <td className="p-6 text-center font-bold text-gray-500">{p.costPrice} ج.م</td>
                  <td className="p-6 text-center font-black text-blue-700 text-lg">{p.salePrice} ج.م</td>
                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-2">
                       <button onClick={() => { setEditingProduct(p); setModalOpen(true); }} className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-edit"></i></button>
                       <button onClick={() => confirmDelete(p.id)} className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><i className="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <div className="p-20 text-center text-gray-300 font-bold italic">لا توجد نتائج بحث</div>}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 border-b bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">{editingProduct?.id ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-2xl"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <input required placeholder="اسم المنتج" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold" value={editingProduct?.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <input placeholder="الباركود" className="flex-1 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none" value={editingProduct?.barcode || ''} onChange={e => setEditingProduct({...editingProduct, barcode: e.target.value})} />
                  <button type="button" onClick={() => { setScannerTarget('edit'); setScannerOpen(true); }} className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><i className="fas fa-camera"></i></button>
                </div>
                <input required type="number" placeholder="الكمية الحالية" className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none" value={editingProduct?.stockQty || ''} onChange={e => setEditingProduct({...editingProduct, stockQty: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="سعر الجملة" className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none" value={editingProduct?.costPrice || ''} onChange={e => setEditingProduct({...editingProduct, costPrice: Number(e.target.value)})} />
                <input required type="number" placeholder="سعر البيع" className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none" value={editingProduct?.salePrice || ''} onChange={e => setEditingProduct({...editingProduct, salePrice: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-xl hover:bg-blue-700 transition-all">حفظ البيانات سحابياً</button>
            </form>
          </div>
        </div>
      )}

      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScan} />
    </div>
  );
};

export default Inventory;
