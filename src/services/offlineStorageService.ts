/**
 * IndexedDB-based offline storage service
 * Provides reliable offline data persistence beyond localStorage limits
 */

const DB_NAME = 'RCBCDebtTrackerDB';
const DB_VERSION = 1;
const STORES = {
  DEBT_STATE: 'debtState',
  PAYMENTS: 'payments',
  MILESTONES: 'milestones',
  OFFLINE_QUEUE: 'offlineQueue',
} as const;

export interface OfflineQueueItem {
  id: string;
  type: 'save_debt' | 'save_payment' | 'delete_payment' | 'save_milestone';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.DEBT_STATE)) {
          db.createObjectStore(STORES.DEBT_STATE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.PAYMENTS)) {
          const paymentStore = db.createObjectStore(STORES.PAYMENTS, { keyPath: 'id' });
          paymentStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.MILESTONES)) {
          db.createObjectStore(STORES.MILESTONES, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
          const queueStore = db.createObjectStore(STORES.OFFLINE_QUEUE, { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Ensure DB is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  /**
   * Save data to a store
   */
  async save<T>(storeName: string, data: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get data from a store by ID
   */
  async get<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all items from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete data from a store
   */
  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from a store
   */
  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add item to offline queue
   */
  async addToQueue(item: Omit<OfflineQueueItem, 'id'>): Promise<void> {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    await this.save(STORES.OFFLINE_QUEUE, queueItem);
  }

  /**
   * Get all items from offline queue
   */
  async getQueue(): Promise<OfflineQueueItem[]> {
    return this.getAll<OfflineQueueItem>(STORES.OFFLINE_QUEUE);
  }

  /**
   * Remove item from offline queue
   */
  async removeFromQueue(id: string): Promise<void> {
    await this.delete(STORES.OFFLINE_QUEUE, id);
  }

  /**
   * Clear offline queue
   */
  async clearQueue(): Promise<void> {
    await this.clear(STORES.OFFLINE_QUEUE);
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();
export { STORES };
