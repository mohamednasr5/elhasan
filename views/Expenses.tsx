
import React, { useState } from 'react';
import { AppState, Expense } from '../types';

interface ExpensesProps {
  state: AppState;
  onUpdateExpenses: (expenses: Expense[]) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ state, onUpdateExpenses }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('إيجار');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(amount),
      category,
      notes,
      createdAt: Date.now()
    };
    onUpdateExpenses([...state.expenses, newExpense]);
    setAmount('');
    setNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-sm border">
        <h2 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
          <i className="fas fa-plus-circle"></i> إضافة مصروف جديد
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required type="number" placeholder="المبلغ" className="p-4 bg-gray-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500" value={amount} onChange={e => setAmount(e.target.value)} />
          <select className="p-4 bg-gray-50 rounded-2xl border outline-none" value={category} onChange={e => setCategory(e.target.value)}>
            <option>إيجار</option>
            <option>كهرباء ومياه</option>
            <option>رواتب</option>
            <option>تسويق</option>
            <option>أخرى</option>
          </select>
          <input placeholder="ملاحظات" className="p-4 bg-gray-50 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500" value={notes} onChange={e => setNotes(e.target.value)} />
          <button type="submit" className="md:col-span-3 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95">إضافة المصروف</button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <h3 className="p-6 font-bold border-b">سجل المصاريف الأخيرة</h3>
        <div className="divide-y">
          {state.expenses.slice().reverse().map(e => (
            <div key={e.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-bold text-gray-800">{e.category}</p>
                <p className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleString('ar-EG')}</p>
                {e.notes && <p className="text-sm text-blue-500 mt-1">{e.notes}</p>}
              </div>
              <span className="text-lg font-bold text-red-600">-{e.amount.toLocaleString()} ج.م</span>
            </div>
          ))}
          {state.expenses.length === 0 && <p className="p-10 text-center text-gray-400">لا يوجد مصاريف مسجلة</p>}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
