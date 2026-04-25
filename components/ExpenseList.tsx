'use client';

import { useState } from 'react';
import { Search, Filter, Pencil, Trash2, X, Download } from 'lucide-react';
import { Expense, FilterState, CATEGORIES, Category, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/expense';
import { filterExpenses, formatCurrency, formatDate, exportToCSV } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const defaultFilters: FilterState = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
};

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = filterExpenses(expenses, filters);
  const hasActiveFilters =
    filters.category !== 'All' || filters.dateFrom || filters.dateTo || filters.search;

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={15} />
            Filters
            {hasActiveFilters && (
              <span className="rounded-full bg-indigo-600 text-white text-xs px-1.5 py-0.5 leading-none">
                {[filters.category !== 'All', filters.dateFrom, filters.dateTo].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={15} />
            CSV
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilter('category', e.target.value as Category | 'All')}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilter('dateFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilter('dateTo', e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
          {hasActiveFilters ? ' (filtered)' : ''}
        </span>
        {filtered.length > 0 && (
          <span className="font-medium text-gray-700">
            Total: {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}
          </span>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400 text-sm">
            {expenses.length === 0 ? 'No expenses yet. Add your first one!' : 'No expenses match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow group"
            >
              {/* Category badge */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ backgroundColor: CATEGORY_COLORS[expense.category] + '20' }}
              >
                {CATEGORY_ICONS[expense.category]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: CATEGORY_COLORS[expense.category] + '15',
                      color: CATEGORY_COLORS[expense.category],
                    }}
                  >
                    {expense.category}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => { setConfirmDelete(null); onEdit(expense); }}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    confirmDelete === expense.id
                      ? 'bg-red-100 text-red-600'
                      : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                  }`}
                  title={confirmDelete === expense.id ? 'Click again to confirm' : 'Delete'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
