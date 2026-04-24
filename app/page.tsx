'use client';

import { useState } from 'react';
import { Plus, LayoutDashboard, List, Moon, Sun } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense, ExpenseFormData } from '@/types/expense';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import Dashboard from '@/components/Dashboard';

type Tab = 'dashboard' | 'expenses';

export default function Home() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [dark, setDark] = useState(false);

  function handleSubmit(data: ExpenseFormData) {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
    setShowForm(false);
    setEditingExpense(undefined);
  }

  function handleEdit(expense: Expense) {
    setEditingExpense(expense);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingExpense(undefined);
  }

  return (
    <div className={`min-h-screen transition-colors ${dark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-sm transition-colors ${dark ? 'border-gray-700 bg-gray-900/80' : 'border-gray-200 bg-white/80'}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <span className="text-sm font-bold text-white">$</span>
            </div>
            <span className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Expense Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              className={`rounded-xl border p-2 transition-colors ${dark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => { setEditingExpense(undefined); setShowForm(true); }}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Plus size={16} />
              Add Expense
            </button>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <div className={`border-b transition-colors ${dark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex gap-0">
            {([
              { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { key: 'expenses', label: 'Expenses', icon: List },
            ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? 'border-indigo-500 text-indigo-500'
                    : dark
                    ? 'border-transparent text-gray-400 hover:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {label}
                {key === 'expenses' && expenses.length > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {expenses.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {!isLoaded ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : tab === 'dashboard' ? (
          <Dashboard expenses={expenses} dark={dark} />
        ) : (
          <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={deleteExpense} />
        )}
      </main>

      {/* Form modal */}
      {showForm && (
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initial={editingExpense}
        />
      )}
    </div>
  );
}
