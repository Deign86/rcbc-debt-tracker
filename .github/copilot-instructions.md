# RCBC Debt Tracker - AI Coding Agent Instructions

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
