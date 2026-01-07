
import React, { useState } from 'react';
import { AppState, SaleItem, Product, Sale } from './types';
import BarcodeScannerModal from './BarcodeScannerModal';
import { PrintInvoice } from './PrintTemplates';
import ReactDOM from 'react-dom/client';

const POS: React.FC<{state: AppState, onSaveSale: (s: Sale) => void}> = ({ state, onSaveSale }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isScannerOpen, setScannerOpen] = useState(false);

  const subTotal = cart.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.qty >= product.stockQty) return alert("الكمية نفذت من المخزن!");
      setCart(cart.map(item => item.productId === product.id ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price } : item));
    } else {
      if (product.stockQty <= 0) return alert("المنتج غير متوفر حالياً!");
      setCart([...cart, { 
        productId: product.id, 
        name: product.name, 
        qty: 1, 
        price: Number(product.salePrice) || 0, 
        costPrice: Number(product.costPrice) || 0, 
        total: Number(product.salePrice) || 0 
      }]);
    }
    setSearch('');
  };

  const updateItemPrice = (productId: string, newPrice: string) => {
    const price = Number(newPrice) || 0;
    setCart(cart.map(item => 
      item.productId === productId ? { ...item, price: price, total: item.qty * price } : item
    ));
  };

  const updateItemQty = (productId: string, newQty: string) => {
    const qty = Number(newQty) || 0;
    const prod = state.products.find(p => p.id === productId);
    if (prod && qty > prod.stockQty) return alert("الكمية المطلوبة غير متاحة!");
    setCart(cart.map(item => 
      item.productId === productId ? { ...item, qty: qty, total: qty * item.price } : item
    ));
  };

  const finalize = (method: 'Cash' | 'Card') => {
    if (cart.length === 0) return;
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      customerName: customer.name || 'عميل نقدي',
      customerPhone: customer.phone,
      items: cart,
      subTotal,
      grandTotal: subTotal,
      paymentMethod: method,
      createdAt: Date.now(),
      userId: 'admin'
    };
    onSaveSale(sale);
    setLastSale(sale);
    setCart([]);
    setCustomer({ name: '', phone: '' });
  };

  const handlePrint = (sale: Sale, mode: 'A4' | 'POS') => {
    const root = ReactDOM.createRoot(document.getElementById('print-section')!);
    root.render(<PrintInvoice data={sale} type="sale" mode={mode} />);
    setTimeout(() => { window.print(); setLastSale(null); }, 500);
  };

  const suggestions = state.products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)).slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-['Cairo'] animate-fade-in pb-24">
      <div className="flex-1 space-y-4">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input placeholder="اسم العميل" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
            <input placeholder="الهاتف" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
          </div>
          <div className="relative flex gap-2">
            <input placeholder="ابحث بالاسم أو الباركود..." className="flex-1 p-5 bg-blue-50 rounded-2xl outline-none font-black text-lg border-2 border-transparent focus:border-blue-600" value={search} onChange={e => setSearch(e.target.value)} />
            <button onClick={() => setScannerOpen(true)} className="px-6 bg-blue-600 text-white rounded-2xl shadow-lg"><i className="fas fa-barcode"></i></button>
            {search && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-2xl mt-2 z-50 border overflow-hidden">
                {suggestions.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} className="w-full text-right p-4 hover:bg-blue-50 flex justify-between border-b">
                    <div>
                      <span className="font-black block text-slate-800">{p.name}</span>
                      <span className="text-xs text-slate-400">المخزون: {p.stockQty}</span>
                    </div>
                    <span className="text-blue-700 font-black">{(Number(p.salePrice) || 0).toLocaleString()} ج.م</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border overflow-hidden min-h-[400px]">
          <div className="p-4 bg-slate-50 border-b font-black text-slate-500 text-sm">أصناف الفاتورة</div>
          <div className="p-4 space-y-3">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl gap-4">
                <div className="flex-1"><p className="font-black text-slate-800">{item.name}</p></div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">السعر</span>
                    <input type="number" className="w-24 p-2 text-center font-black bg-white rounded-xl border-2 border-blue-100 focus:border-blue-600 outline-none" value={item.price} onChange={(e) => updateItemPrice(item.productId, e.target.value)} />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">الكمية</span>
                    <input type="number" className="w-20 p-2 text-center font-black bg-white rounded-xl border-2 border-slate-200 outline-none" value={item.qty} onChange={(e) => updateItemQty(item.productId, e.target.value)} />
                  </div>
                  <div className="text-left min-w-[100px]">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">الإجمالي</span>
                    <span className="text-lg font-black text-slate-900">{(Number(item.total) || 0).toLocaleString()}</span>
                  </div>
                  <button onClick={() => setCart(cart.filter(i => i.productId !== item.productId))} className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-full"><i className="fas fa-trash"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96">
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl space-y-6 sticky top-8">
           <h3 className="text-xl font-black border-b border-white/10 pb-4">إجمالي المطلوب</h3>
           <div className="flex justify-between items-baseline text-5xl font-black text-blue-400">
             <span>{(Number(subTotal) || 0).toLocaleString()}</span>
             <span className="text-sm font-normal mr-2">ج.م</span>
           </div>
           <div className="pt-4 space-y-3">
              <button onClick={() => finalize('Cash')} className="w-full py-5 bg-white text-slate-950 rounded-[24px] font-black text-xl hover:bg-blue-50">دفع نقدي</button>
              <button onClick={() => finalize('Card')} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xl">بطاقة بنكية</button>
           </div>
        </div>
      </div>

      {lastSale && (
        <div className="fixed inset-0 z-[250] bg-slate-950/80 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><i className="fas fa-check text-4xl"></i></div>
             <h3 className="text-2xl font-black mb-2">تم الحفظ بنجاح</h3>
             <div className="space-y-3 mt-8">
                <button onClick={() => handlePrint(lastSale, 'POS')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">طابعة كاشير</button>
                <button onClick={() => handlePrint(lastSale, 'A4')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">فاتورة A4</button>
                <button onClick={() => setLastSale(null)} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">إغلاق</button>
             </div>
          </div>
        </div>
      )}
      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScan={b => { const p = state.products.find(x => x.barcode === b); if(p) addToCart(p); setScannerOpen(false); }} />
    </div>
  );
};

export default POS;
