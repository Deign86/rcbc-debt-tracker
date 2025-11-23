# Firestore Integration

## Overview
The RCBC Debt Tracker now persists all data to Firebase Firestore in real-time without requiring authentication.

## Data Structure

### Collections

#### `debtState`
Stores the current debt state (single document with ID "current"):
- `currentPrincipal` (number): Current outstanding balance
- `interestRate` (number): Monthly interest rate (0.035 = 3.5%)
- `minimumPayment` (number): Current minimum payment amount
- `statementDate` (timestamp): Statement date
- `dueDate` (timestamp): Payment due date
- `updatedAt` (timestamp): Last update timestamp

#### `payments`
Stores all payment transactions:
- `amount` (number): Payment amount
- `date` (timestamp): Payment date
- `principal` (number): Amount applied to principal
- `interest` (number): Amount applied to interest
- `type` (string): "payment" or "adjustment"
- `note` (string, optional): Additional notes
- `createdAt` (timestamp): Record creation timestamp

## Features

### Real-time Sync
- All debt state changes are automatically saved to Firestore
- Payment history updates in real-time across all tabs/devices
- Automatic loading of saved state on app start

### No Authentication Required
Since this is a single-user application, authentication is not required. The Firestore security rules allow public read/write access:

```
match /debtState/{document=**} {
  allow read, write: if true;
}

match /payments/{document=**} {
  allow read, write: if true;
}
```

⚠️ **Important**: If you plan to use this for multiple users, implement proper authentication and update the security rules.

## Service Functions

Located in `src/services/firestoreService.ts`:

### Debt State
- `saveDebtState(debtState)`: Save current debt state
- `loadDebtState()`: Load saved debt state
- `subscribeToDebtState(callback)`: Real-time debt state updates

### Payments
- `savePayment(payment)`: Save a new payment
- `loadRecentPayments(limit)`: Load recent payments
- `subscribeToPayments(limit, callback)`: Real-time payment updates

## Usage in Components

### Dashboard
```typescript
// Load saved state on mount
useEffect(() => {
  const loadData = async () => {
    const savedDebtState = await loadDebtState();
    if (savedDebtState) {
      adjustPrincipal(savedDebtState.currentPrincipal);
      updateMinimumPayment(savedDebtState.minimumPayment);
    }
  };
  loadData();
}, []);

// Auto-save on changes
useEffect(() => {
  if (!loading) {
    saveDebtState(debtState);
  }
}, [debtState, loading]);

// Real-time payment updates
useEffect(() => {
  const unsubscribe = subscribeToPayments(50, setPayments);
  return () => unsubscribe();
}, []);
```

### History Page
Full payment history with statistics is now available in the History tab.

## Deployment

Security rules are already deployed. To redeploy if needed:
```bash
firebase deploy --only firestore:rules
```

## Testing

1. Open the app at http://localhost:5176
2. Make a payment - it will be saved to Firestore
3. Refresh the page - your data persists
4. Open another tab - changes sync in real-time
5. Check the History tab to see all transactions

## Firebase Console

Monitor your data at:
https://console.firebase.google.com/project/rcbc-debt-tracker-app/firestore
