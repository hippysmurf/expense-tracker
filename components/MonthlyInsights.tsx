'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Expense, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/expense';
import { formatCurrency, getCurrentMonthKey, getMonthKey, todayISO } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  dark?: boolean;
}

function computeBudgetStreak(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const dateSet = new Set(expenses.map((e) => e.date));
  let streak = 0;
  const today = todayISO();
  // Walk backwards from today
  const cursor = new Date();
  // If today has no expense yet, start counting from yesterday
  let dateStr = today;
  if (!dateSet.has(dateStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (!dateSet.has(dateStr)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function MonthlyInsights({ expenses, dark = false }: Props) {
  const currentMonth = getCurrentMonthKey();
  const thisMonth = expenses.filter((e) => getMonthKey(e.date) === currentMonth);

  const byCategory = CATEGORIES.map((cat) => {
    const total = thisMonth.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return { name: cat, value: total, color: CATEGORY_COLORS[cat], icon: CATEGORY_ICONS[cat] };
  })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const top3 = byCategory.slice(0, 3);
  const streak = computeBudgetStreak(expenses);

  const tooltipStyle = {
    borderRadius: 10,
    border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
    backgroundColor: dark ? '#1f2937' : '#fff',
    color: dark ? '#f9fafb' : '#111827',
    fontSize: 12,
  };

  const card = `rounded-2xl border shadow-sm p-5 transition-colors ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`;
  const heading = `text-sm font-semibold mb-4 ${dark ? 'text-gray-300' : 'text-gray-700'}`;

  if (expenses.length === 0) {
    return (
      <div className={`rounded-2xl border border-dashed py-20 text-center transition-colors ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="text-3xl mb-3">📊</p>
        <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Add some expenses to see your monthly insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Donut chart */}
      <div className={card}>
        <h3 className={heading}>This Month — Spending by Category</h3>
        {byCategory.length === 0 ? (
          <p className={`text-sm text-center py-10 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No expenses this month yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={byCategory}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={false}
              >
                {byCategory.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v)), 'Spent']}
                contentStyle={tooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top 3 categories */}
      <div className={card}>
        <h3 className={heading}>Top 3 Categories</h3>
        {top3.length === 0 ? (
          <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No data for this month.</p>
        ) : (
          <div className="space-y-3">
            {top3.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-lg">{cat.icon}</span>
                <span className={`flex-1 text-sm font-medium ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {cat.name}
                </span>
                <span className={`text-sm font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatCurrency(cat.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Streak */}
      <div className={card}>
        <h3 className={heading}>Budget Streak</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-bold text-emerald-500 leading-none">{streak}</p>
            <p className={`text-sm mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
              {streak === 1 ? 'day' : 'days'} logging expenses
            </p>
          </div>
          <div className={`flex items-center gap-1 rounded-full px-4 py-2 ${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const hasExpense = expenses.some((e) => e.date === key);
              return (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full ${hasExpense ? 'bg-emerald-500' : dark ? 'bg-gray-600' : 'bg-gray-300'}`}
                  title={key}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
