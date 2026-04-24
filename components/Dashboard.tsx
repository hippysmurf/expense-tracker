'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Tag } from 'lucide-react';
import { Expense, CATEGORIES, CATEGORY_COLORS } from '@/types/expense';
import { formatCurrency, getCurrentMonthKey, getMonthKey } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  dark?: boolean;
}

interface SummaryCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  dark?: boolean;
}

function SummaryCard({ title, value, sub, icon, color, dark }: SummaryCardProps) {
  return (
    <div className={`rounded-2xl border shadow-sm p-5 transition-colors ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {sub && <p className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function Dashboard({ expenses, dark = false }: Props) {
  const currentMonth = getCurrentMonthKey();

  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const thisMonth = expenses.filter((e) => getMonthKey(e.date) === currentMonth);
  const totalMonth = thisMonth.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const byCategory = CATEGORIES.map((cat) => {
    const total = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return { name: cat, value: total, color: CATEGORY_COLORS[cat] };
  }).filter((c) => c.value > 0);

  // Top category
  const topCategory = byCategory.sort((a, b) => b.value - a.value)[0];

  // Last 6 months bar chart
  const months: { label: string; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    months.push({ label, key });
  }

  const barData = months.map(({ label, key }) => ({
    month: label,
    amount: expenses.filter((e) => getMonthKey(e.date) === key).reduce((s, e) => s + e.amount, 0),
  }));

  const tooltipStyle = {
    borderRadius: 10,
    border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
    backgroundColor: dark ? '#1f2937' : '#fff',
    color: dark ? '#f9fafb' : '#111827',
    fontSize: 12,
  };

  if (expenses.length === 0) {
    return (
      <div className={`rounded-2xl border border-dashed py-20 text-center transition-colors ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
        <TrendingUp size={32} className={`mx-auto mb-3 ${dark ? 'text-gray-600' : 'text-gray-300'}`} />
        <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Add some expenses to see your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard dark={dark} title="Total Spending" value={formatCurrency(totalAll)} sub={`${expenses.length} expenses`} icon={<DollarSign size={18} className="text-indigo-600" />} color="bg-indigo-50" />
        <SummaryCard dark={dark} title="This Month" value={formatCurrency(totalMonth)} sub={`${thisMonth.length} expenses`} icon={<Calendar size={18} className="text-emerald-600" />} color="bg-emerald-50" />
        <SummaryCard dark={dark} title="Top Category" value={topCategory ? topCategory.name : '—'} sub={topCategory ? formatCurrency(topCategory.value) : undefined} icon={<Tag size={18} className="text-amber-600" />} color="bg-amber-50" />
        <SummaryCard dark={dark} title="Avg per Expense" value={expenses.length > 0 ? formatCurrency(totalAll / expenses.length) : '$0'} sub="all time" icon={<TrendingUp size={18} className="text-rose-600" />} color="bg-rose-50" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className={`rounded-2xl border shadow-sm p-5 transition-colors ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-sm font-semibold mb-4 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Monthly Spending (last 6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: dark ? '#6b7280' : '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: dark ? '#6b7280' : '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Spent']} contentStyle={tooltipStyle} />
              <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className={`rounded-2xl border shadow-sm p-5 transition-colors ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-sm font-semibold mb-4 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Spending by Category</h3>
          {byCategory.length === 0 ? (
            <div className={`flex items-center justify-center h-[220px] text-sm ${dark ? 'text-gray-600' : 'text-gray-300'}`}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {byCategory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [formatCurrency(Number(v)), 'Spent']} contentStyle={tooltipStyle} />
                <Legend formatter={(value) => <span style={{ fontSize: 12, color: dark ? '#d1d5db' : '#374151' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category breakdown table */}
      <div className={`rounded-2xl border shadow-sm p-5 transition-colors ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <h3 className={`text-sm font-semibold mb-4 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Category Breakdown</h3>
        <div className="space-y-3">
          {byCategory
            .sort((a, b) => b.value - a.value)
            .map((cat) => {
              const pct = totalAll > 0 ? (cat.value / totalAll) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{cat.name}</span>
                    <span className={dark ? 'text-gray-400' : 'text-gray-500'}>
                      {formatCurrency(cat.value)}{' '}
                      <span className={dark ? 'text-gray-600' : 'text-gray-400'}>({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className={`h-2 w-full rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
