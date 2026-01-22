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
import type { DebtState, Payment, MilestoneAchievement } from '../types/debt';
import { CacheService, CACHE_KEYS } from './cacheService';
import { offlineSyncService } from './offlineSyncService';
import { offlineStorage, STORES } from './offlineStorageService';

// Collection names
const DEBT_STATE_COLLECTION = 'debtState';
const PAYMENTS_COLLECTION = 'payments';
const MILESTONES_COLLECTION = 'milestones';

// Document ID for the single debt state (since there's no auth, we use a fixed ID)
const DEBT_STATE_DOC_ID = 'current';

// Cache TTL: 5 minutes for debt state, 10 minutes for payment history
const DEBT_STATE_CACHE_TTL = 1000 * 60 * 5;
const PAYMENT_HISTORY_CACHE_TTL = 1000 * 60 * 10;

/**
 * Save the current debt state to Firestore
 * Queues for offline sync if network is unavailable
 */
export const saveDebtState = async (debtState: DebtState): Promise<void> => {
  try {
    // Always save to offline storage first for immediate UI update
    await offlineStorage.save(STORES.DEBT_STATE, { id: DEBT_STATE_DOC_ID, ...debtState });
    
    // Update cache for immediate access
    CacheService.set(CACHE_KEYS.DEBT_STATE, debtState, DEBT_STATE_CACHE_TTL);
    
    // Check if online before attempting Firestore save
    if (!offlineSyncService.getOnlineStatus()) {
      console.log('Offline: Queuing debt state save for later sync');
      await offlineSyncService.queueOperation('save_debt', debtState);
      return;
    }
    
    // Online: Save to Firestore
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
    // If online save fails, queue for later
    if (offlineSyncService.getOnlineStatus()) {
      await offlineSyncService.queueOperation('save_debt', debtState);
    }
    throw error;
  }
};

/**
 * Load the current debt state from Firestore
 * Uses cache-first strategy with offline storage fallback
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
      
      // Return cached data immediately, fetch fresh data in background if online
      if (offlineSyncService.getOnlineStatus()) {
        fetchAndCacheDebtState().catch(console.error);
      }
      return cached;
    }
    
    // Try offline storage next
    const offlineData = await offlineStorage.get<DebtState & { id: string }>(
      STORES.DEBT_STATE, 
      DEBT_STATE_DOC_ID
    );
    
    if (offlineData) {
      const debtState: DebtState = {
        currentPrincipal: offlineData.currentPrincipal,
        interestRate: offlineData.interestRate,
        minimumPayment: offlineData.minimumPayment,
        statementDate: typeof offlineData.statementDate === 'string' 
          ? new Date(offlineData.statementDate) 
          : offlineData.statementDate,
        dueDate: typeof offlineData.dueDate === 'string' 
          ? new Date(offlineData.dueDate) 
          : offlineData.dueDate,
      };
      
      // Cache it
      CacheService.set(CACHE_KEYS.DEBT_STATE, debtState, DEBT_STATE_CACHE_TTL);
      
      // Fetch fresh if online
      if (offlineSyncService.getOnlineStatus()) {
        fetchAndCacheDebtState().catch(console.error);
      }
      
      return debtState;
    }
    
    // Finally, try Firestore if online
    if (offlineSyncService.getOnlineStatus()) {
      try {
        return await fetchAndCacheDebtState();
      } catch (firestoreError) {
        // If Firestore fails (permission denied, not configured, etc.), 
        // gracefully return null and use defaults
        console.warn('Firestore fetch failed, using local storage or defaults:', firestoreError);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    // Don't throw for permission errors - just log and return null
    // This allows the app to work without Firebase configuration
    console.warn('Error loading debt state (using defaults):', error);
    return null;
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
 * Queues for offline sync if network is unavailable
 */
export const savePayment = async (payment: Omit<Payment, 'id'>): Promise<string> => {
  try {
    // Validate payment data
    if (!payment.amount || payment.amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    if (!payment.date || !(payment.date instanceof Date)) {
      throw new Error('Invalid payment date');
    }
    
    // Generate temp ID for offline storage
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save to offline storage immediately
    await offlineStorage.save(STORES.PAYMENTS, {
      id: tempId,
      ...payment,
    });
    
    // Invalidate payment history cache
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(CACHE_KEYS.PAYMENT_HISTORY)
      );
      keys.forEach(key => CacheService.remove(key));
    } catch (cacheError) {
      // Non-critical error, log and continue
      console.warn('Error invalidating payment cache:', cacheError);
    }
    
    // Check if online before attempting Firestore save
    if (!offlineSyncService.getOnlineStatus()) {
      console.log('Offline: Queuing payment save for later sync');
      await offlineSyncService.queueOperation('save_payment', payment);
      return tempId;
    }
    
    // Online: Save to Firestore
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
      amount: payment.amount,
      date: Timestamp.fromDate(payment.date),
      principal: payment.principal,
      interest: payment.interest,
      type: payment.type,
      note: payment.note || null,
      createdAt: Timestamp.now(),
    });
    
    // Replace temp ID with real Firestore ID in offline storage
    await offlineStorage.delete(STORES.PAYMENTS, tempId);
    await offlineStorage.save(STORES.PAYMENTS, {
      id: docRef.id,
      ...payment,
    });
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving payment:', error);
    // If online save fails, queue for later
    if (offlineSyncService.getOnlineStatus()) {
      await offlineSyncService.queueOperation('save_payment', payment);
    }
    
    // Return temp ID even on error so UI can continue
    // Generate temp ID if not already defined
    const errorTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore rules.');
    } else if (error?.code === 'unavailable') {
      throw new Error('Network unavailable. Please check your connection.');
    } else if (error?.message) {
      throw new Error(error.message);
    }
    
    return errorTempId;
    
    throw new Error('Failed to save payment');
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
    
    // No cache, try to fetch from Firestore
    try {
      return await fetchAndCachePayments(limitCount);
    } catch (firestoreError) {
      console.warn('Firestore payments fetch failed, returning empty:', firestoreError);
      return [];
    }
  } catch (error) {
    // Don't throw - return empty array so app can still function
    console.warn('Error loading payments (returning empty):', error);
    return [];
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
    // Clear IndexedDB offline storage FIRST (this is the main source of persisted data)
    try {
      await offlineStorage.clear(STORES.DEBT_STATE);
      await offlineStorage.clear(STORES.PAYMENTS);
      await offlineStorage.clear(STORES.MILESTONES);
      await offlineStorage.clearQueue();
      console.log('Cleared IndexedDB offline storage');
    } catch (offlineError) {
      console.warn('Failed to clear offline storage:', offlineError);
    }

    // Clear all localStorage caches
    try {
      CacheService.clearAll();
      console.log('Cleared localStorage cache');
    } catch (cacheError) {
      console.warn('Failed to clear cache:', cacheError);
    }

    // Only attempt Firestore operations if online
    if (offlineSyncService.getOnlineStatus()) {
      const batch = writeBatch(db);
      
      // Delete debt state
      const debtStateRef = doc(db, DEBT_STATE_COLLECTION, DEBT_STATE_DOC_ID);
      batch.delete(debtStateRef);
      
      // Get all payments and delete them
      try {
        const paymentsQuery = query(collection(db, PAYMENTS_COLLECTION));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        paymentsSnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
      } catch (error) {
        console.warn('Error fetching payments for deletion:', error);
      }
      
      // Get all milestones and delete them
      try {
        const milestonesQuery = query(collection(db, MILESTONES_COLLECTION));
        const milestonesSnapshot = await getDocs(milestonesQuery);
        
        milestonesSnapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
      } catch (error) {
        console.warn('Error fetching milestones for deletion:', error);
      }
      
      // Commit all deletions
      await batch.commit();
      console.log('Cleared Firestore data');
    } else {
      console.log('Offline: Firestore data will be cleared when back online');
    }
  } catch (error: any) {
    console.error('Error resetting data:', error);
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore rules.');
    } else if (error?.code === 'unavailable') {
      throw new Error('Network unavailable. Please check your connection.');
    } else if (error?.message) {
      throw new Error(error.message);
    }
    
    throw new Error('Failed to reset data');
  }
};

/**
 * Save a milestone achievement to Firestore
 */
export const saveMilestoneAchievement = async (milestone: Omit<MilestoneAchievement, 'celebrated'>): Promise<void> => {
  try {
    // Validate milestone data
    if (!milestone.achievedDate || !(milestone.achievedDate instanceof Date)) {
      throw new Error('Invalid milestone date');
    }
    
    const docRef = doc(db, MILESTONES_COLLECTION, `milestone-${milestone.milestone}`);
    await setDoc(docRef, {
      milestone: milestone.milestone,
      achievedDate: Timestamp.fromDate(milestone.achievedDate),
      principalAtAchievement: milestone.principalAtAchievement,
      celebrated: false,
    });
  } catch (error: any) {
    console.error('Error saving milestone achievement:', error);
    
    // Milestone saving is non-critical, so we log but don't crash
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied for milestone. Check Firestore rules.');
    } else if (error?.code === 'unavailable') {
      console.warn('Network unavailable. Milestone will be saved later.');
    }
    
    throw error;
  }
};

/**
 * Mark a milestone as celebrated
 */
export const markMilestoneCelebrated = async (milestone: number): Promise<void> => {
  try {
    const docRef = doc(db, MILESTONES_COLLECTION, `milestone-${milestone}`);
    await setDoc(docRef, { celebrated: true }, { merge: true });
  } catch (error) {
    console.error('Error marking milestone as celebrated:', error);
    throw error;
  }
};

/**
 * Load all milestone achievements from Firestore
 */
export const loadMilestoneAchievements = async (): Promise<MilestoneAchievement[]> => {
  try {
    const milestonesSnapshot = await getDocs(collection(db, MILESTONES_COLLECTION));
    const milestones: MilestoneAchievement[] = [];
    
    milestonesSnapshot.forEach((doc) => {
      const data = doc.data();
      milestones.push({
        milestone: data.milestone,
        achievedDate: data.achievedDate.toDate(),
        principalAtAchievement: data.principalAtAchievement,
        celebrated: data.celebrated || false,
      });
    });
    
    return milestones;
  } catch (error) {
    // Don't throw - return empty array so app can still function without Firebase
    console.warn('Error loading milestone achievements (returning empty):', error);
    return [];
  }
};
