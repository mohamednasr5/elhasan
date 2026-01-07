import React, { useState, useEffect } from 'react';
import { AppState, UserRole, Sale, Product, RepairTicket, Expense, Purchase } from './types';
import Layout from './Layout';
import Dashboard from './Dashboard';
import POS from './POS';
import Inventory from './Inventory';
import Repair from './Repair';
import Expenses from './Expenses';
import Reports from './Reports';
import Purchases from './Purchases';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    products: [],
    sales: [],
    repairs: [],
    expenses: [],
    purchases: [],
    currentUser: null,
    isOffline: false,
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // @ts-ignore
    const fdb = window.db_firebase;
    if (!fdb) {
      setLoading(false);
      return;
    }

    // Load products
    const productsListener = fdb.ref('products').on('value', (snap: any) => {
      const data = snap.val();
      const list = data
        ? Object.keys(data).map((id) => {
            const p = data[id];
            return {
              id,
              name: p.name || '',
              barcode: p.barcode || '',
              category: p.category || 'عام',
              brand: p.brand || 'بدون ماركة',
              costPrice: Number(p.costPrice || p.cost || 0),
              salePrice: Number(p.salePrice || 0),
              stockQty: Number(p.stockQty || p.qty || 0),
              minStockAlert: Number(p.minStockAlert || p.minStock || 2),
              updatedAt: p.updatedAt || Date.now(),
            };
          })
        : [];
      setState((prev) => ({ ...prev, products: list }));
    });

    // Load sales
    const salesListener = fdb.ref('sales_v2').on('value', (snap: any) => {
      const data = snap.val();
      const list = data ? Object.keys(data).map((id) => ({ id, ...data[id] })) : [];
      setState((prev) => ({ ...prev, sales: list }));
    });

    // Load expenses
    const expensesListener = fdb.ref('expenses_v2').on('value', (snap: any) => {
      const data = snap.val();
      const list = data ? Object.keys(data).map((id) => ({ id, ...data[id] })) : [];
      setState((prev) => ({ ...prev, expenses: list }));
    });

    // Load repairs
    const repairsListener = fdb.ref('repairs').on('value', (snap: any) => {
      const data = snap.val();
      const list = data ? Object.keys(data).map((id) => ({ id, ...data[id] })) : [];
      setState((prev) => ({ ...prev, repairs: list }));
    });

    // Load purchases
    const purchasesListener = fdb.ref('purchases').on('value', (snap: any) => {
      const data = snap.val();
      const list = data ? Object.keys(data).map((id) => ({ id, ...data[id] })) : [];
      setState((prev) => ({ ...prev, purchases: list }));
      setLoading(false);
    });

    // Cleanup listeners on unmount
    return () => {
      fdb.ref('products').off('value', productsListener);
      fdb.ref('sales_v2').off('value', salesListener);
      fdb.ref('expenses_v2').off('value', expensesListener);
      fdb.ref('repairs').off('value', repairsListener);
      fdb.ref('purchases').off('value', purchasesListener);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '521988') {
      setIsAuthenticated(true);
      setState((prev) => ({
        ...prev,
        currentUser: { id: 'admin', name: 'المدير العام', role: UserRole.ADMIN },
      }));
    } else {
      alert('الرمز السري خاطئ');
    }
  };

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center bg-slate-900 text-white font-['Cairo']"
        dir="rtl"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          جاري تحميل البيانات من السحابة...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-['Cairo']"
        dir="rtl"
      >
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-center text-white">
            <h1 className="text-3xl font-black">الحسن للهواتف</h1>
            <p className="opacity-60 text-xs">نظام الإدارة السحابي v3.0</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <input
              type="password"
              autoFocus
              className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-blue-600 outline-none text-center text-4xl font-black"
              placeholder="••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-5 bg-blue-700 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-blue-800 transition-all"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userRole={state.currentUser?.role}
      onLogout={() => setIsAuthenticated(false)}
    >
      {activeTab === 'dashboard' && <Dashboard state={state} />}
      {activeTab === 'pos' && (
        <POS
          state={state}
          onSaveSale={(sale: Sale) => {
            // @ts-ignore
            window.db_firebase.ref('sales_v2').push(sale);
            sale.items.forEach((item) => {
              const p = state.products.find((prod) => prod.id === item.productId);
              if (p) {
                // @ts-ignore
                window.db_firebase
                  .ref(`products/${p.id}`)
                  .update({ stockQty: (Number(p.stockQty) || 0) - (Number(item.qty) || 0) });
              }
            });
          }}
        />
      )}
      {activeTab === 'inventory' && <Inventory state={state} />}
      {activeTab === 'repair' && <Repair state={state} />}
      {activeTab === 'expenses' && (
        <Expenses
          state={state}
          onUpdateExpenses={(exps: Expense[]) => {
            if (exps.length > 0) {
              // @ts-ignore
              window.db_firebase.ref('expenses_v2').push(exps[exps.length - 1]);
            }
          }}
        />
      )}
      {activeTab === 'reports' && <Reports state={state} />}
      {activeTab === 'purchases' && (
        <Purchases
          state={state}
          onSavePurchase={(purchase: Purchase) => {
            // @ts-ignore
            window.db_firebase.ref('purchases').push(purchase);
          }}
        />
      )}
    </Layout>
  );
};

export default App;
//
