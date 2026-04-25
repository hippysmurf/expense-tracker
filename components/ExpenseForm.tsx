'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Expense, ExpenseFormData, CATEGORIES, Category } from '@/types/expense';
import { todayISO } from '@/lib/utils';

interface Props {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  initial?: Expense;
}

const empty: ExpenseFormData = {
  amount: '',
  category: 'Food',
  description: '',
  date: todayISO(),
};

export default function ExpenseForm({ onSubmit, onCancel, initial }: Props) {
  const [form, setForm] = useState<ExpenseFormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});

  useEffect(() => {
    if (initial) {
      setForm({
        amount: initial.amount.toString(),
        category: initial.category,
        description: initial.description,
        date: initial.date,
      });
    } else {
      setForm({ ...empty, date: todayISO() });
    }
    setErrors({});
  }, [initial]);

  function validate(): boolean {
    const errs: Partial<Record<keyof ExpenseFormData, string>> = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount greater than 0';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  function field(key: keyof ExpenseFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => field('amount', e.target.value)}
                className={`w-full rounded-xl border pl-8 pr-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.amount ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => field('category', e.target.value as Category)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="What did you spend on?"
              value={form.description}
              onChange={(e) => field('description', e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              max={todayISO()}
              onChange={(e) => field('date', e.target.value)}
              className={`w-full rounded-xl border px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                errors.date ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'
              }`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              {initial ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
