# CLAUDE.md

This file defines mandatory workflows, conventions, and rules for Claude Code when working on this repository. All instructions here must be followed precisely and completely before any work is considered done.

Repository
Remote: https://github.com/hippysmurf/expense-tracker
Default branch: main

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

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

1. Branch Workflow (MANDATORY — Do This First)
Before making any code changes, you must create and check out a feature branch. No work may be done directly on main or any other existing branch.
Steps
bash# 1. Ensure you are on an up-to-date main
git checkout main
git pull origin main

# 2. Create and switch to a feature branch
#    Name format: feature_<short_snake_case_description>
#    Examples:
#      feature_add_category_filter
#      feature_export_csv
#      feature_fix_date_parsing
git checkout -b feature_<short_name>

# 3. Verify you are on the new branch before proceeding
git branch --show-current
Rules:

Branch names must start with feature_ followed by a short, lowercase, snake_case description of the work.
Never commit directly to main.
If a branch for the feature already exists, check it out and pull the latest changes rather than creating a duplicate.


2. Automated Tests (MANDATORY)
Every piece of code added or modified must have corresponding automated tests. Tests are not optional.
Requirements

All new functions, classes, and modules must have unit tests.
All bug fixes must include a regression test that fails before the fix and passes after.
All API endpoints or service methods must have integration tests.
Test files must live alongside the source they test, or in a dedicated tests/ or __tests__/ directory mirroring the source tree.
Test coverage must not decrease from the baseline. Aim for ≥ 80% coverage on all new code.

Test File Naming
Source fileTest filesrc/expenses.tssrc/expenses.test.ts or tests/expenses.test.tssrc/utils/currency.pytests/utils/test_currency.pylib/parser.golib/parser_test.go
Writing Good Tests

Test behaviour, not implementation details.
Cover happy paths, edge cases, and error/failure paths.
Use descriptive test names: it('returns zero total when expense list is empty').
Mock external dependencies (databases, HTTP calls, file system) to keep tests fast and deterministic.
Do not commit tests that are skipped or marked .todo without a corresponding GitHub issue reference in a comment.


3. Build & Test Gate (MANDATORY — Before Every Commit)
All code must compile without errors and all tests must pass before any commit is made. A failing test or compile error is a blocker — do not commit and do not proceed until it is resolved.
Pre-Commit Checklist
Run the following sequence and confirm each step succeeds:
bash# Step 1 — Install / sync dependencies
#   (use the appropriate command for the project's package manager)
npm install         # Node.js / TypeScript
# OR
pip install -r requirements.txt   # Python
# OR
go mod tidy         # Go

# Step 2 — Compile / type-check
npm run build       # TypeScript / JS
# OR
npx tsc --noEmit    # TypeScript type-check only
# OR
go build ./...      # Go
# OR
python -m py_compile src/**/*.py  # Python syntax check

# Step 3 — Lint
npm run lint        # JS/TS (eslint / biome)
# OR
flake8 src/         # Python
# OR
golangci-lint run   # Go

# Step 4 — Run all tests
npm test            # JS/TS (jest / vitest)
# OR
pytest              # Python
# OR
go test ./...       # Go

# Step 5 — Confirm 0 failures before continuing
If any step fails: fix the issue, re-run from Step 1, and only commit once the entire sequence is green.

4. Committing Changes
Only commit after the build and test gate (Section 3) passes completely.
Commit Message Format
Use the Conventional Commits specification:
<type>(<scope>): <short summary>

[optional body — explain *why*, not *what*]

[optional footer — e.g. Closes #42]
Types: feat, fix, refactor, test, chore, docs, perf, ci
Examples:
feat(expenses): add recurring expense support
fix(parser): handle negative amounts in CSV import
test(auth): add missing edge cases for token expiry
Commit Steps
bash# Stage only intentional changes — review the diff first
git diff --staged

git add <files>

# Commit with a conventional message
git commit -m "feat(expenses): add category filter to expense list"

5. Pushing to GitHub
After committing, push the feature branch to the remote repository.
bash# Push the feature branch (first push sets the upstream)
git push -u origin feature_<short_name>

# Subsequent pushes on the same branch
git push
Rules:

Always push to the feature branch — never force-push to main.
If the push is rejected due to a conflict, rebase onto the latest main, resolve conflicts, re-run the build & test gate, then push again:

bashgit fetch origin
git rebase origin/main
# resolve any conflicts, then:
npm test            # or equivalent — confirm tests still pass
git push

6. Pull Requests
After pushing, open a Pull Request on GitHub targeting main.
PR requirements:

Title follows the same Conventional Commits format as the commit message.
Description includes: what changed, why, and how to test it manually.
All CI checks must pass before merging.
At least one approval is required before merging (if collaborators are present).
Squash-merge or rebase-merge preferred to keep main history clean.


7. Project-Specific Conventions
Expense Data Model
All expense records must include the following fields at minimum:
FieldTypeNotesidUUID / stringAuto-generated, immutableamountdecimal / numberAlways stored in minor units (e.g. cents) to avoid float errorscurrencystringISO 4217 code (e.g. USD, CAD)categorystringMust be one of the defined CATEGORIES enum/constantdescriptionstringHuman-readable labeldateISO 8601 dateYYYY-MM-DD formatcreatedAtISO 8601 datetimeSet on creation, never modifiedupdatedAtISO 8601 datetimeUpdated on every write
Currency Handling

Never use floating-point arithmetic for money. Use integer arithmetic in minor units or a dedicated decimal library.
All display formatting must go through a single formatCurrency(amount, currency) utility function.

Error Handling

Never silently swallow errors. All caught errors must be logged or re-thrown with context.
User-facing error messages must not expose internal stack traces or system details.

Environment Variables

Secrets and configuration must use environment variables, never hardcoded values.
A .env.example file must be kept up to date with all required variable names (but no real values).
Never commit .env files.


8. What Claude Must Never Do

❌ Commit directly to main
❌ Skip writing tests for new or changed code
❌ Commit code that does not compile
❌ Commit code with failing tests
❌ Push without running the full build & test sequence
❌ Hardcode secrets, API keys, or credentials
❌ Use floating-point arithmetic for monetary values
❌ Open a PR without a passing CI build


Quick Reference: Full Workflow
1. git checkout main && git pull origin main
2. git checkout -b feature_<short_name>
3. [ write code ]
4. [ write tests for all new/changed code ]
5. npm install (or equivalent)
6. npm run build (or equivalent) — must succeed
7. npm test (or equivalent) — all tests must pass
8. git add <files>
9. git commit -m "type(scope): summary"
10. git push -u origin feature_<short_name>
11. Open Pull Request → main on GitHub(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.nonce='LEUE9xdt5RDLhWzIW17x4g==';d.innerHTML="window.__CF$cv$params={r:'9f19dfc32c7d2937',t:'MTc3NzA4MzY4NA=='};var a=document.createElement('script');a.nonce='LEUE9xdt5RDLhWzIW17x4g==';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();