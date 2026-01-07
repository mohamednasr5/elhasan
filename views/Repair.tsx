
import React, { useState } from 'react';
import { AppState, RepairTicket, RepairStatus, Product, SaleItem } from '../types';
import ReactDOM from 'react-dom/client';
import { PrintInvoice } from '../components/PrintTemplates';

interface RepairProps {
  state: AppState;
  onUpdateRepairs: (repairs: RepairTicket[]) => void;
  onUpdateProducts: (products: Product[]) => void;
}

const Repair: React.FC<RepairProps> = ({ state, onUpdateRepairs, onUpdateProducts }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Partial<RepairTicket> | null>(null);
  const [partSearch, setPartSearch] = useState('');
  const [showPartSuggestions, setShowPartSuggestions] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    const newTicket: RepairTicket = {
      id: editingTicket.id || Math.random().toString(36).substr(2, 9),
      ticketNo: editingTicket.ticketNo || `REP-${Date.now().toString().slice(-6)}`,
      customerName: editingTicket.customerName || '',
      customerPhone: editingTicket.customerPhone || '',
      deviceType: editingTicket.deviceType || '',
      deviceModel: editingTicket.deviceModel || '',
      imei: editingTicket.imei || '',
      issueDescription: editingTicket.issueDescription || '',
      status: editingTicket.status || RepairStatus.RECEIVED,
      technician: editingTicket.technician || state.currentUser?.name || 'فني الصيانة',
      partsUsed: editingTicket.partsUsed || [],
      laborCost: Number(editingTicket.laborCost) || 0,
      totalCost: (Number(editingTicket.laborCost) || 0) + (editingTicket.partsUsed?.reduce((s, i) => s + i.total, 0) || 0),
      deposit: Number(editingTicket.deposit) || 0,
      receivedDate: editingTicket.receivedDate || Date.now(),
      expectedDelivery: editingTicket.expectedDelivery || (Date.now() + 86400000),
    };

    if (editingTicket.id) {
      onUpdateRepairs(state.repairs.map(r => r.id === newTicket.id ? newTicket : r));
    } else {
      onUpdateRepairs([...state.repairs, newTicket]);
    }

    setModalOpen(false);
    setEditingTicket(null);
  };

  const handlePrint = (ticket: any, mode: 'A4' | 'POS') => {
    const printContainer = document.getElementById('print-section');
    if (!printContainer) return;
    const root = ReactDOM.createRoot(printContainer);
    root.render(<PrintInvoice data={ticket} type="repair" mode={mode} />);
    setTimeout(() => window.print(), 500);
  };

  const addPartToTicket = (product: Product) => {
    const parts = editingTicket?.partsUsed || [];
    const existing = parts.find(p => p.productId === product.id);
    let updatedParts;
    if (existing) {
      updatedParts = parts.map(p => p.productId === product.id ? {...p, qty: p.qty + 1, total: (p.qty + 1) * p.price} : p);
    } else {
      updatedParts = [...parts, { productId: product.id, name: product.name, qty: 1, price: product.salePrice, discount: 0, total: product.salePrice }];
    }
    setEditingTicket({...editingTicket, partsUsed: updatedParts});
    setPartSearch('');
    setShowPartSuggestions(false);
  };

  const partSuggestions = state.products.filter(p => 
    p.name.toLowerCase().includes(partSearch.toLowerCase()) || p.barcode.includes(partSearch)
  ).slice(0, 5);

  return (
    <div className="space-y-6 font-['Cairo']">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">إدارة تذاكر الصيانة</h2>
        <button 
          onClick={() => { setEditingTicket({ partsUsed: [], status: RepairStatus.RECEIVED }); setModalOpen(true); }}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          تذكرة صيانة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.repairs.slice().reverse().map(ticket => (
          <div key={ticket.id} className="bg-white p-5 rounded-2xl shadow-sm border hover:border-blue-300 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block">{ticket.ticketNo}</span>
                <h3 className="font-black text-gray-800">{ticket.deviceModel}</h3>
                <p className="text-xs text-blue-600 font-bold">{ticket.customerName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                ticket.status === RepairStatus.DELIVERED ? 'bg-green-100 text-green-700' : 
                ticket.status === RepairStatus.COMPLETED ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="flex gap-2 mt-4">
               <button onClick={() => handlePrint(ticket, 'POS')} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"><i className="fas fa-print mr-1"></i> كاشير</button>
               <button onClick={() => handlePrint(ticket, 'A4')} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all"><i className="fas fa-file-invoice mr-1"></i> A4</button>
               <button onClick={() => { setEditingTicket(ticket); setModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><i className="fas fa-edit"></i></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b bg-blue-700 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">بيانات الصيانة</h3>
              <button onClick={() => setModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-blue-900 border-b pb-2">العميل والجهاز</h4>
                  <input required placeholder="اسم العميل" className="w-full p-3 bg-gray-50 rounded-xl border" value={editingTicket?.customerName || ''} onChange={e => setEditingTicket({...editingTicket, customerName: e.target.value})} />
                  <input required placeholder="رقم الهاتف" className="w-full p-3 bg-gray-50 rounded-xl border" value={editingTicket?.customerPhone || ''} onChange={e => setEditingTicket({...editingTicket, customerPhone: e.target.value})} />
                  <input required placeholder="الموديل (iPhone 13)" className="w-full p-3 bg-gray-50 rounded-xl border" value={editingTicket?.deviceModel || ''} onChange={e => setEditingTicket({...editingTicket, deviceModel: e.target.value})} />
                  <textarea placeholder="وصف العطل" className="w-full p-3 bg-gray-50 rounded-xl border h-24" value={editingTicket?.issueDescription || ''} onChange={e => setEditingTicket({...editingTicket, issueDescription: e.target.value})}></textarea>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-blue-900 border-b pb-2">التكاليف</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="المصنعية" className="w-full p-3 bg-gray-50 rounded-xl border" value={editingTicket?.laborCost || ''} onChange={e => setEditingTicket({...editingTicket, laborCost: e.target.value})} />
                    <input type="number" placeholder="العربون" className="w-full p-3 bg-gray-50 rounded-xl border" value={editingTicket?.deposit || ''} onChange={e => setEditingTicket({...editingTicket, deposit: e.target.value})} />
                  </div>
                  <select className="w-full p-3 bg-gray-50 rounded-xl border font-bold" value={editingTicket?.status || RepairStatus.RECEIVED} onChange={e => setEditingTicket({...editingTicket, status: e.target.value as RepairStatus})}>
                    {Object.values(RepairStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                 <button type="submit" className="flex-1 py-4 bg-blue-700 text-white rounded-2xl font-black shadow-xl">حفظ التذكرة</button>
                 <button type="button" onClick={() => setModalOpen(false)} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repair;
