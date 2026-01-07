import React, { useState } from 'react';
import { AppState, RepairTicket, RepairStatus } from './types';
import ReactDOM from 'react-dom/client';
import { PrintInvoice } from './PrintTemplates';

const Repair: React.FC<{state: AppState}> = ({ state }) => {
  const [modal, setModal] = useState<any>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    const fdb = window.firebase.database();
    const id = modal.id || fdb.ref().child('repairs').push().key;
    const data = {
      ...modal,
      id,
      ticketNo: modal.ticketNo || `REP-${Date.now().toString().slice(-6)}`,
      receivedDate: modal.receivedDate || Date.now(),
      status: modal.status || RepairStatus.RECEIVED,
      totalCost: Number(modal.totalCost) || 0,
      deposit: Number(modal.deposit) || 0
    };
    fdb.ref(`repairs/${id}`).set(data);
    setModal(null);
  };

  const handlePrint = (ticket: any, mode: 'A4' | 'POS') => {
    const printContainer = document.getElementById('print-section');
    if (!printContainer) return;
    const root = ReactDOM.createRoot(printContainer);
    root.render(<PrintInvoice data={ticket} type="repair" mode={mode} />);
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="space-y-8 font-['Cairo'] animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900">قسم الصيانة</h2>
        <button onClick={() => setModal({ status: RepairStatus.RECEIVED, laborCost: 0, deposit: 0 })} className="px-8 py-4 bg-emerald-600 text-white rounded-3xl font-black shadow-lg shadow-emerald-100 hover:scale-105 transition-all flex items-center gap-2"><i className="fas fa-plus"></i> تذكرة جديدة</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.repairs.slice().reverse().map(ticket => (
          <div key={ticket.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-6">
               <div>
                 <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">{ticket.ticketNo}</p>
                 <h3 className="font-black text-xl text-slate-800">{ticket.deviceModel}</h3>
                 <p className="text-xs text-blue-600 font-bold">{ticket.customerName}</p>
               </div>
               <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter ${
                 ticket.status === 'تم الاستلام' ? 'bg-blue-100 text-blue-600' :
                 ticket.status === 'جاهز للتسليم' ? 'bg-emerald-100 text-emerald-600' :
                 ticket.status === 'تم التسليم للعميل' ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'
               }`}>
                 {ticket.status}
               </span>
            </div>
            <div className="flex gap-2">
               <button onClick={() => handlePrint(ticket, 'POS')} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-900 hover:text-white transition-all">كاشير</button>
               <button onClick={() => setModal(ticket)} className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-edit"></i></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-6 backdrop-blur-sm no-print">
           <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <h3 className="text-xl font-black">تفاصيل تذكرة الصيانة</h3>
                 <button onClick={() => setModal(null)} className="text-2xl opacity-50"><i className="fas fa-times"></i></button>
              </div>
              <form onSubmit={handleSave} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 mr-2 uppercase">العميل</label>
                       <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={modal.customerName || ''} onChange={e => setModal({...modal, customerName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 mr-2 uppercase">الهاتف</label>
                       <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={modal.customerPhone || ''} onChange={e => setModal({...modal, customerPhone: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2 uppercase">موديل الجهاز</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={modal.deviceModel || ''} onChange={e => setModal({...modal, deviceModel: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 mr-2 uppercase">التكلفة الإجمالية</label>
                       <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={modal.totalCost} onChange={e => setModal({...modal, totalCost: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 mr-2 uppercase">العربون (المدفوع)</label>
                       <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none text-emerald-600" value={modal.deposit} onChange={e => setModal({...modal, deposit: e.target.value})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-emerald-100 transition-all">حفظ وإرسال للسحابة</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

// Fix: Add missing default export
export default Repair;