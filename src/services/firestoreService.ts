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
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { DebtState, Payment } from '../types/debt';

// Collection names
const DEBT_STATE_COLLECTION = 'debtState';
const PAYMENTS_COLLECTION = 'payments';

// Document ID for the single debt state (since there's no auth, we use a fixed ID)
const DEBT_STATE_DOC_ID = 'current';

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
  } catch (error) {
    console.error('Error saving debt state:', error);
    throw error;
  }
};

/**
 * Load the current debt state from Firestore
 */
export const loadDebtState = async (): Promise<DebtState | null> => {
  try {
    const docRef = doc(db, DEBT_STATE_COLLECTION, DEBT_STATE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        currentPrincipal: data.currentPrincipal,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        statementDate: data.statementDate.toDate(),
        dueDate: data.dueDate.toDate(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading debt state:', error);
    throw error;
  }
};

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
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving payment:', error);
    throw error;
  }
};

/**
 * Load recent payments from Firestore
 */
export const loadRecentPayments = async (limitCount: number = 50): Promise<Payment[]> => {
  try {
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
    
    return payments;
  } catch (error) {
    console.error('Error loading payments:', error);
    throw error;
  }
};

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
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
};
