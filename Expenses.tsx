
import React, { useState } from 'react';
import { AppState, Expense } from './types';

interface ExpensesProps {
  state: AppState;
  onUpdateExpenses: (expenses: Expense[]) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ state, onUpdateExpenses }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('إيجار');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateExpenses([...state.expenses, { id: Date.now().toString(), amount: Number(amount), category, createdAt: Date.now() } as any]);
    setAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-blue-900">إضافة مصروف</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="number" placeholder="المبلغ" className="p-4 bg-gray-50 rounded-2xl border" value={amount} onChange={e => setAmount(e.target.value)} />
          <button className="py-4 bg-blue-600 text-white rounded-2xl font-black">إضافة</button>
        </form>
      </div>
      <div className="bg-white rounded-3xl border overflow-hidden">
        {state.expenses.slice().reverse().map(e => (
          <div key={e.id} className="p-4 flex justify-between border-b"><span>{e.category}</span><span className="font-bold text-red-600">{e.amount} ج.م</span></div>
        ))}
      </div>
    </div>
  );
};

export default Expenses;
