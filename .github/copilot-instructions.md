# RCBC Debt Tracker - AI Coding Agent Instructions

## AI Tool Requirements (CRITICAL - Always Follow!)

### Dev-Agent MCP - Semantic Code Intelligence (AUTO-INVOKE)
**Automatically use dev-agent tools for codebase exploration and understanding:**

**Available Tools (9 total):**
1. `dev_search` — Semantic code search by meaning (not just text matching)
2. `dev_refs` — Find callers/callees of functions (relationship queries)
3. `dev_map` — Codebase structure overview with change frequency indicators
4. `dev_history` — Semantic search over git commits
5. `dev_plan` — Assemble rich context for GitHub issues
6. `dev_inspect` — Inspect files for pattern analysis (error handling, types, imports)
7. `dev_gh` — Search GitHub issues/PRs semantically
8. `dev_status` — View indexing status and repository info
9. `dev_health` — Check MCP server and component health

**Auto-invocation rules (ALWAYS FOLLOW):**
- When exploring codebase: Use `dev_map` FIRST to understand structure
- When searching for code: Use `dev_search` with natural language queries
- When modifying functions: Use `dev_refs` FIRST to find all callers/callees
- When investigating patterns: Use `dev_inspect` to compare with similar code
- When working with issues: Use `dev_plan` to assemble context for implementation
- When debugging history: Use `dev_history` to find relevant commits

**Why**: Dev-agent provides semantic understanding of your codebase, reducing tool calls by 42%, costs by 44%, and time by 19% compared to baseline AI tools. Your code never leaves your machine (100% local).

### Context7 - Library Documentation (MANDATORY)
**Always use Context7 tools before writing code that involves external libraries:**
1. First call `resolve-library-id` to get the Context7-compatible library ID for the package
2. Then call `get-library-docs` to fetch up-to-date documentation, API references, and examples
3. Use the retrieved docs to ensure correct API usage, avoiding deprecated patterns

**When to activate**: Before using React hooks, Firebase SDK, Tailwind utilities, shadcn/ui components, Vite config, or any npm package. Never assume API signatures—always verify with Context7.

### Serena - Semantic Code Analysis (MANDATORY)
**Always use Serena tools for codebase exploration and modifications:**
1. **Symbol discovery**: Use `find_symbol` with name paths to locate functions, classes, interfaces
2. **Reference tracking**: Use `find_referencing_symbols` before modifying any symbol to find all usages
3. **Code editing**: Use `replace_symbol_body` for precise symbol-level edits
4. **Pattern search**: Use `search_for_pattern` for flexible text/regex searches across files
5. **File overview**: Use `get_symbols_overview` to understand file structure before diving in

**When to activate**: 
- Before any code modification (understand dependencies first)
- When searching for implementations or usages
- When refactoring symbols that may be referenced elsewhere
- When navigating unfamiliar parts of the codebase

### Tool Priority Order
1. **Codebase exploration**: Dev-Agent `dev_map` → `dev_search` → Serena symbolic tools
2. **Searching code**: Dev-Agent `dev_search` → `dev_refs` → Serena pattern search
3. **Library usage**: Context7 docs → then implement
4. **Editing code**: Dev-Agent `dev_refs` → Serena find references → Serena symbolic edit
5. **Debugging**: Dev-Agent `dev_history` → `dev_inspect` → targeted file reads
6. **Issue context**: Dev-Agent `dev_plan` → `dev_gh` for related issues/PRs

---

## Project Overview
Mobile-first PWA for RCBC credit card debt tracking using **Average Daily Balance (ADB) interest calculation**. Built with React 19, TypeScript, Vite, Firebase (Firestore + Auth + Storage + Data Connect), and Tailwind CSS with a custom "Match Aesthetic" design system (Sage Green & Navy Blue palette).

## Architecture & Key Patterns

### 3-Layer Caching Strategy (Critical!)
Performance-optimized with layered caching—**always maintain cache invalidation**:
1. **IndexedDB (Firestore persistence)**: `enableIndexedDbPersistence()` in `src/config/firebase.ts`
2. **LocalStorage (CacheService)**: `src/services/cacheService.ts` - 5min TTL for debt state, 10min for payments
3. **Service Worker (Workbox)**: `vite.config.ts` - NetworkFirst for APIs (7 days), CacheFirst for images (30 days)

**When modifying data**: Always call `CacheService.clearAll()` or update specific cache keys after Firestore writes (see `firestoreService.ts` patterns).

### Firebase Architecture
- **No authentication flow**: Single user mode with fixed doc ID `'current'` in all collections
- **Collections**: `debtState`, `payments`, `milestones` (see `src/services/firestoreService.ts`)
- **Data Connect**: GraphQL API in `dataconnect/` with generated SDK in `src/dataconnect-generated/`
- **Storage**: Hosts transparent logo via `scripts/upload-logos.cjs`

### Interest Calculation - RCBC Specifics
**Never use simple interest!** All calculations must use ADB method from `src/utils/adbInterestCalculation.ts`:
```typescript
// Correct approach:
import { calculatePaymentSplit, calculateSimpleADBInterest } from '@/utils/adbInterestCalculation';
const split = calculatePaymentSplit(principal, payment, BILLING_CONSTANTS.BILLING_CYCLE_DAYS);

// Constants (src/config/billingConstants.ts):
MONTHLY_INTEREST_RATE: 0.035 (3.5%)
DAILY_INTEREST_RATE: 0.035 / 30
BILLING_CYCLE_START_DAY: 22
DUE_DATE_DAY: 17
MINIMUM_PAYMENT_RATE: 0.05 (5% of balance)
MINIMUM_PAYMENT_FLOOR: 500
```

**Formula**: `Interest = ADB × Daily Rate × Days in Cycle`
- Payment splits go through `calculatePaymentSplit()` which handles interest-first allocation
- Simulator uses `projectPaymentSchedule()` for multi-month forecasting

## Component Patterns

### State Management
- **Theme**: `ThemeContext` (light/dark, defaults to light, persisted in localStorage)
- **Auth**: `AuthContext` (placeholder—currently single-user mode)
- **Debt State**: Managed via `useDebtCalculator` hook (`src/hooks/useDebtCalculator.ts`)

### UI Components (shadcn/ui)
Located in `src/components/ui/`. Use existing components before creating new ones:
```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
```

### Mobile-First Conventions
- **Touch targets**: Minimum 44px × 44px (see `<Button size="lg">` in forms)
- **Bottom sheets**: Use shadcn `Sheet` component with `side="bottom"` for mobile drawers
- **Input modes**: `inputMode="decimal"` for currency inputs (triggers native number keyboard)
- **Safe areas**: Tailwind classes like `pb-safe` (configured in `tailwind.config.js`)

### Design System Colors
```javascript
// From tailwind.config.js - use semantic names:
primary: 'matcha' (sage green shades 50-900)
secondary: 'navy' (dark green #2f5435)
background: CSS vars (hsl-based for dark mode support)
// Always use: className="bg-primary-500 text-primary-foreground"
```

## Development Workflows

### Build & Deploy
```bash
npm run dev          # Vite dev server with HMR (port 5173)
npm run build        # TypeScript check + Vite build → dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint (config: eslint.config.js)
```

### Firebase Operations
```bash
# Upload logo to Firebase Storage:
npm run upload-logo  # Uses scripts/upload-logos.cjs

# Deploy (requires Firebase CLI):
firebase deploy      # Deploys Firestore rules, Storage rules, Data Connect
```

### Common Tasks
- **Add new debt field**: Update `DebtState` in `src/types/debt.ts` → `firestoreService.ts` save/load → cache invalidation
- **Modify interest logic**: Edit `src/utils/adbInterestCalculation.ts` → update tests in comments
- **New page**: Add route in `App.tsx` → create in `src/pages/` → add nav in `Layout.tsx`

## Critical Files Reference

| File | Purpose | Notes |
|------|---------|-------|
| `src/utils/adbInterestCalculation.ts` | **Core business logic** | All interest calculations—never bypass |
| `src/services/firestoreService.ts` | Firestore CRUD + caching | Cache-first pattern, always invalidate on writes |
| `src/config/billingConstants.ts` | RCBC-specific constants | Modify here to adjust rates/dates |
| `src/hooks/useDebtCalculator.ts` | Debt state hook | Used by Dashboard, Simulator |
| `vite.config.ts` | Build config + PWA | Manual chunks, service worker config |
| `tailwind.config.js` | Design system | Custom colors, screens, animations |

## Debugging Tips
- **Cache issues**: Check Application tab → LocalStorage/IndexedDB, clear with `CacheService.clearAll()`
- **Interest mismatch**: Log `calculatePaymentSplit()` inputs/outputs—verify `DAILY_INTEREST_RATE` used
- **Mobile layout**: Use DevTools device mode, test with `sm:` breakpoints (390px)
- **Firestore errors**: Check Network tab for 403s (rules: `firestore.rules`), verify doc ID is `'current'`

## Code Style Preferences
- **Imports**: Use `@/` alias (e.g., `import { cn } from '@/lib/utils'`)
- **Types**: Explicit interfaces in `src/types/`, no inline types for shared state
- **Formatting**: Tailwind utilities before custom classes, group by responsive variants
- **Error handling**: Try-catch in async Firestore calls, always log to console

## Testing Considerations
- **Simulator accuracy**: Verify payment schedules match manual Excel calculations
- **Edge cases**: Test with balance < ₱500 (minimum payment floor), exact payoff scenarios
- **Cache TTL**: Use DevTools timestamps to verify 5min/10min expirations work
