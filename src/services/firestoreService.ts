import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  Timestamp,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DebtState, Payment } from '../types/debt';
import { CacheService, CACHE_KEYS } from './cacheService';

// Collection names
const DEBT_STATE_COLLECTION = 'debtState';
const PAYMENTS_COLLECTION = 'payments';

// Document ID for the single debt state (since there's no auth, we use a fixed ID)
const DEBT_STATE_DOC_ID = 'current';

// Cache TTL: 5 minutes for debt state, 10 minutes for payment history
const DEBT_STATE_CACHE_TTL = 1000 * 60 * 5;
const PAYMENT_HISTORY_CACHE_TTL = 1000 * 60 * 10;

/**
 * Save the current debt state to Firestore
 */
export const saveDebtState = async (debtState: DebtState): Promise<void> => {
  try {
    const docRef = doc(db, DEBT_STATE_COLLECTION, DEBT_STATE_DOC_ID);
    await setDoc(docRef, {
      currentPrincipal: debtState.currentPrincipal,
      interestRate: debtState.interestRate,
      minimumPayment: debtState.minimumPayment,
      statementDate: Timestamp.fromDate(debtState.statementDate),
      dueDate: Timestamp.fromDate(debtState.dueDate),
      updatedAt: Timestamp.now(),
    });
    
    // Update cache after successful save
    CacheService.set(CACHE_KEYS.DEBT_STATE, debtState, DEBT_STATE_CACHE_TTL);
  } catch (error) {
    console.error('Error saving debt state:', error);
    throw error;
  }
};

/**
 * Load the current debt state from Firestore
 * Uses cache-first strategy for faster initial loads
 */
export const loadDebtState = async (): Promise<DebtState | null> => {
  try {
    // Try to get from cache first (cache-first strategy)
    const cached = CacheService.get<DebtState>(CACHE_KEYS.DEBT_STATE, DEBT_STATE_CACHE_TTL);
    if (cached) {
      // Convert string dates back to Date objects if needed
      if (typeof cached.statementDate === 'string') {
        cached.statementDate = new Date(cached.statementDate);
      }
      if (typeof cached.dueDate === 'string') {
        cached.dueDate = new Date(cached.dueDate);
      }
      
      // Return cached data immediately, fetch fresh data in background
      fetchAndCacheDebtState().catch(console.error);
      return cached;
    }
    
    // No cache, fetch from Firestore
    return await fetchAndCacheDebtState();
  } catch (error) {
    console.error('Error loading debt state:', error);
    throw error;
  }
};

/**
 * Helper function to fetch debt state from Firestore and update cache
 */
async function fetchAndCacheDebtState(): Promise<DebtState | null> {
  const docRef = doc(db, DEBT_STATE_COLLECTION, DEBT_STATE_DOC_ID);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    const debtState: DebtState = {
      currentPrincipal: data.currentPrincipal,
      interestRate: data.interestRate,
      minimumPayment: data.minimumPayment,
      statementDate: data.statementDate.toDate(),
      dueDate: data.dueDate.toDate(),
    };
    
    // Update cache
    CacheService.set(CACHE_KEYS.DEBT_STATE, debtState, DEBT_STATE_CACHE_TTL);
    return debtState;
  }
  
  return null;
}

/**
 * Subscribe to real-time debt state updates
 */
export const subscribeToDebtState = (
  callback: (debtState: DebtState | null) => void
): (() => void) => {
  const docRef = doc(db, DEBT_STATE_COLLECTION, DEBT_STATE_DOC_ID);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        currentPrincipal: data.currentPrincipal,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        statementDate: data.statementDate.toDate(),
        dueDate: data.dueDate.toDate(),
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to debt state:', error);
  });
};

/**
 * Save a payment to Firestore
 */
export const savePayment = async (payment: Omit<Payment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
      amount: payment.amount,
      date: Timestamp.fromDate(payment.date),
      principal: payment.principal,
      interest: payment.interest,
      type: payment.type,
      note: payment.note || null,
      createdAt: Timestamp.now(),
    });
    
    // Invalidate payment history cache since new payment was added
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(CACHE_KEYS.PAYMENT_HISTORY)
    );
    keys.forEach(key => CacheService.remove(key));
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving payment:', error);
    throw error;
  }
};

/**
 * Load recent payments from Firestore
 * Uses cache-first strategy for faster initial loads
 */
export const loadRecentPayments = async (limitCount: number = 50): Promise<Payment[]> => {
  try {
    const cacheKey = `${CACHE_KEYS.PAYMENT_HISTORY}-${limitCount}`;
    
    // Try to get from cache first
    const cached = CacheService.get<Payment[]>(cacheKey, PAYMENT_HISTORY_CACHE_TTL);
    if (cached && cached.length > 0) {
      // Convert string dates back to Date objects
      const payments = cached.map(p => ({
        ...p,
        date: typeof p.date === 'string' ? new Date(p.date) : p.date,
      }));
      
      // Return cached data immediately, fetch fresh data in background
      fetchAndCachePayments(limitCount).catch(console.error);
      return payments;
    }
    
    // No cache, fetch from Firestore
    return await fetchAndCachePayments(limitCount);
  } catch (error) {
    console.error('Error loading payments:', error);
    throw error;
  }
};

/**
 * Helper function to fetch payments from Firestore and update cache
 */
async function fetchAndCachePayments(limitCount: number): Promise<Payment[]> {
  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  const payments: Payment[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    payments.push({
      id: doc.id,
      amount: data.amount,
      date: data.date.toDate(),
      principal: data.principal,
      interest: data.interest,
      type: data.type,
      note: data.note || undefined,
    });
  });
  
  // Update cache
  const cacheKey = `${CACHE_KEYS.PAYMENT_HISTORY}-${limitCount}`;
  CacheService.set(cacheKey, payments, PAYMENT_HISTORY_CACHE_TTL);
  
  return payments;
}

/**
 * Subscribe to real-time payment updates
 */
export const subscribeToPayments = (
  limitCount: number = 50,
  callback: (payments: Payment[]) => void
): (() => void) => {
  const q = query(
    collection(db, PAYMENTS_COLLECTION),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        amount: data.amount,
        date: data.date.toDate(),
        principal: data.principal,
        interest: data.interest,
        type: data.type,
        note: data.note || undefined,
      });
    });
    callback(payments);
  }, (error) => {
    console.error('Error subscribing to payments:', error);
  });
};

/**
 * Delete a single payment by ID
 */
export const deletePayment = async (paymentId: string): Promise<void> => {
  try {
    const docRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await deleteDoc(docRef);
    
    // Invalidate payment history cache
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(CACHE_KEYS.PAYMENT_HISTORY)
    );
    keys.forEach(key => CacheService.remove(key));
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

/**
 * Reset all data - deletes debt state and all payments
 */
export const resetAllData = async (): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Delete debt state
    const debtStateRef = doc(db, DEBT_STATE_COLLECTION, DEBT_STATE_DOC_ID);
    batch.delete(debtStateRef);
    
    // Get all payments and delete them
    const paymentsQuery = query(collection(db, PAYMENTS_COLLECTION));
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    paymentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Commit all deletions
    await batch.commit();
    
    // Clear all caches after reset
    CacheService.clearAll();
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
};
