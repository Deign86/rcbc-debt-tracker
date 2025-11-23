import { saveDebtState } from './firestoreService';
import type { DebtState } from '../types/debt';

/**
 * Initialize Firestore with default debt state
 * Call this to reset the app to initial state
 */
export const initializeFirestore = async (): Promise<void> => {
  const initialDebtState: DebtState = {
    currentPrincipal: 50249.75,
    interestRate: 0.035,
    minimumPayment: 1508.00,
    statementDate: new Date(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  };

  try {
    await saveDebtState(initialDebtState);
    console.log('✅ Firestore initialized with default debt state');
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    throw error;
  }
};

/**
 * Check if Firestore has been initialized
 * (For debugging purposes)
 */
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    const { loadDebtState } = await import('./firestoreService');
    const state = await loadDebtState();
    console.log('✅ Firestore connected. Current state:', state);
    return true;
  } catch (error) {
    console.error('❌ Firestore connection error:', error);
    return false;
  }
};
