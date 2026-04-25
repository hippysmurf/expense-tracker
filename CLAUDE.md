# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture

Single-page Next.js 16 app (App Router) using the client-side only. All state lives in the browser — there is no backend or database.

**Data flow:**
- `hooks/useExpenses.ts` — sole source of truth. Loads/saves expenses to `localStorage` under the key `expense-tracker-data`. Exposes `addExpense`, `updateExpense`, `deleteExpense`, `clearAll`.
- `app/page.tsx` — root client component. Owns tab state (`dashboard` | `expenses`), the add/edit modal, and dark mode toggle. Passes expenses and handlers down to components.

**Key files:**
- `types/expense.ts` — `Expense`, `ExpenseFormData`, `FilterState` interfaces; `CATEGORIES`, `CATEGORY_COLORS`, `CATEGORY_ICONS` constants.
- `lib/utils.ts` — pure helpers: `formatCurrency`, `formatDate`, `filterExpenses`, `exportToCSV`, month key utilities.
- `components/Dashboard.tsx` — charts (Recharts) and summary stats.
- `components/ExpenseList.tsx` — filterable/sortable table with inline edit/delete.
- `components/ExpenseForm.tsx` — modal form for add/edit; uses `ExpenseFormData` (amount is a string until parsed on save).

**Styling:** Tailwind CSS v4 with the `@tailwindcss/postcss` plugin. Dark mode is managed via a `dark` boolean prop threaded from `page.tsx` — not via Tailwind's `dark:` variant or a context provider.
