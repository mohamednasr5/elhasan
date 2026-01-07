
import React, { useState } from 'react';
import { AppState, SaleItem, Product, Sale } from '../types';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { PrintInvoice } from '../components/PrintTemplates';
import ReactDOM from 'react-dom/client';

interface POSProps {
  state: AppState;
  onSaveSale: (sale: Sale) => void;
}

const POS: React.FC<POSProps> = ({ state, onSaveSale }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.qty >= product.stockQty) {
        alert("تنبيه: الكمية المطلوبة تتجاوز المتاح في المخزن!");
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price }
          : item
      ));
    } else {
      if (product.stockQty <= 0) {
        alert("المنتج نافذ من المخزن!");
        return;
      }
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        qty: 1,
        price: product.salePrice,
        discount: 0,
        total: product.salePrice
      }]);
    }
    setSearch('');
    setShowSuggestions(false);
  };

  const updateQtyManually = (productId: string, val: string) => {
    const numVal = parseInt(val) || 0;
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const prod = state.products.find(p => p.id === productId);
        if (prod && numVal > prod.stockQty) {
          alert(`لا يمكنك تجاوز الكمية المتاحة (${prod.stockQty})`);
          return item;
        }
        return { ...item, qty: numVal, total: numVal * item.price };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => setCart(cart.filter(i => i.productId !== id));

  const handlePrint = (sale: Sale, mode: 'A4' | 'POS') => {
    const printContainer = document.getElementById('print-section');
    if (!printContainer) return;
    
    const root = ReactDOM.createRoot(printContainer);
    root.render(<PrintInvoice data={sale} type="sale" mode={mode} />);
    
    setTimeout(() => {
      window.print();
      setLastSale(null); // غلق المودال بعد الطباعة
    }, 500);
  };

  const finalizeSale = () => {
    if (cart.length === 0) return;
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: cart,
      subTotal,
      totalDiscount: 0,
      tax: 0,
      grandTotal: subTotal,
      paymentMethod: 'Cash',
      createdAt: Date.now(),
      userId: state.currentUser?.id || '1'
    };
    onSaveSale(newSale);
    setLastSale(newSale); // فتح مودال خيارات الطباعة
    setCart([]);
    setCustomer({ name: '', phone: '' });
  };

  // Fix: Added handleBarcodeScan to resolve the "Cannot find name" error
  const handleBarcodeScan = (barcode: string) => {
    const product = state.products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
    } else {
      alert("عذراً، هذا المنتج غير مسجل في المخزن أو الباركود غير صحيح");
    }
  };

  const suggestions = state.products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search) || p.brand.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full font-['Cairo'] animate-fade-in relative">
      <div className="flex-1 space-y-4">
        {/* شريط البحث والعميل */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border">
          <h2 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-2">
            <i className="fas fa-file-invoice text-blue-600"></i>
            إنشاء فاتورة مبيعات
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input 
              placeholder="اسم العميل (اختياري)" 
              className="w-full p-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-300 outline-none transition-all font-bold"
              value={customer.name}
              onChange={e => setCustomer({...customer, name: e.target.value})}
            />
            <input 
              placeholder="رقم الهاتف" 
              className="w-full p-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-300 outline-none transition-all font-bold"
              value={customer.phone}
              onChange={e => setCustomer({...customer, phone: e.target.value})}
            />
          </div>

          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="ابحث باسم المنتج أو امسح الباركود..."
                className="w-full pr-12 py-4 bg-blue-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-100 font-bold"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
              />
              {showSuggestions && search && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-2xl mt-3 z-50 overflow-hidden border">
                  {suggestions.map(p => (
                    <button key={p.id} onClick={() => addToCart(p)} className="w-full text-right p-4 hover:bg-blue-50 border-b last:border-0 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{p.name}</span>
                        <span className="text-[10px] text-blue-500 font-bold">{p.brand} | المتاح: {p.stockQty}</span>
                      </div>
                      <span className="font-black text-blue-700">{p.salePrice} ج.م</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setScannerOpen(true)} className="px-6 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100">
              <i className="fas fa-barcode text-xl"></i>
            </button>
          </div>
        </div>

        {/* سلة المشتريات */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden min-h-[400px]">
          <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-black text-gray-700">الأصناف المضافة</h3>
          </div>
          <div className="p-5 space-y-4">
            {cart.map(item => (
              <div key={item.productId} className="flex flex-col md:flex-row justify-between items-center p-5 bg-gray-50 rounded-2xl gap-4 border border-transparent hover:border-blue-200">
                <div className="flex-1">
                  <p className="font-black text-gray-800">{item.name}</p>
                  <p className="text-xs text-blue-600 font-bold">سعر الوحدة: {item.price.toLocaleString()} ج.م</p>
                </div>
                <div className="flex items-center gap-6">
                   <input 
                    type="number" 
                    className="w-20 p-2 text-center font-black bg-white rounded-xl border-2" 
                    value={item.qty} 
                    onChange={(e) => updateQtyManually(item.productId, e.target.value)}
                   />
                   <span className="font-black text-gray-900 text-lg w-32 text-left">{item.total.toLocaleString()} ج.م</span>
                   <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600">
                     <i className="fas fa-trash-alt"></i>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96">
        <div className="bg-white p-8 rounded-3xl shadow-xl border sticky top-8 space-y-8">
           <h3 className="font-black text-xl text-blue-900 border-b pb-4">ملخص الفاتورة</h3>
           <div className="flex justify-between items-center text-3xl font-black text-gray-900">
             <span>المطلوب</span>
             <span className="text-blue-700">{subTotal.toLocaleString()} ج.م</span>
           </div>
           <button 
             onClick={finalizeSale}
             disabled={cart.length === 0}
             className="w-full py-5 bg-blue-700 text-white rounded-2xl font-black text-xl shadow-2xl disabled:opacity-50"
           >
             إتمام وحفظ الفاتورة
           </button>
        </div>
      </div>

      {/* مودال خيارات الطباعة */}
      {lastSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-slide-up text-center">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check text-4xl"></i>
             </div>
             <h3 className="text-2xl font-black mb-2 text-gray-800">تم حفظ الفاتورة بنجاح!</h3>
             <p className="text-gray-500 mb-8">رقم الفاتورة: {lastSale.invoiceNo}</p>
             
             <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => handlePrint(lastSale, 'POS')}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all"
                >
                  <i className="fas fa-print"></i> طابعة كاشير (POS)
                </button>
                <button 
                  onClick={() => handlePrint(lastSale, 'A4')}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
                >
                  <i className="fas fa-file-invoice"></i> طابعة عادية (A4)
                </button>
                <button 
                  onClick={() => setLastSale(null)}
                  className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200"
                >
                  إغلاق بدون طباعة
                </button>
             </div>
          </div>
        </div>
      )}

      <BarcodeScannerModal isOpen={isScannerOpen} onClose={() => setScannerOpen(false)} onScan={handleBarcodeScan} />
    </div>
  );
};

export default POS;
