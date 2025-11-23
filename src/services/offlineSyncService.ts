/**
 * Offline sync service
 * Manages queueing operations when offline and syncing when connection is restored
 */

import { offlineStorage, STORES, type OfflineQueueItem } from './offlineStorageService';
import type { DebtState, Payment } from '../types/debt';
import { saveDebtState as firestoreSaveDebtState, savePayment as firestoreSavePayment } from './firestoreService';

export type SyncStatus = 'idle' | 'syncing' | 'error';

class OfflineSyncService {
  private isOnline: boolean = navigator.onLine;
  private syncStatus: SyncStatus = 'idle';
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private syncInProgress: boolean = false;

  constructor() {
    this.setupNetworkListeners();
    // Initialize offline storage
    offlineStorage.init().catch(console.error);
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  /**
   * Handle online event
   */
  private handleOnline = async (): Promise<void> => {
    console.log('Connection restored, syncing offline queue...');
    this.isOnline = true;
    await this.syncOfflineQueue();
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    console.log('Connection lost, switching to offline mode...');
    this.isOnline = false;
  };

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Subscribe to sync status changes
   */
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify listeners of sync status change
   */
  private notifySyncStatus(status: SyncStatus): void {
    this.syncStatus = status;
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Queue an operation for offline sync
   */
  async queueOperation(
    type: OfflineQueueItem['type'],
    data: any
  ): Promise<void> {
    try {
      await offlineStorage.addToQueue({
        type,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      });
      console.log(`Queued operation: ${type}`, data);
    } catch (error) {
      console.error('Error queuing operation:', error);
      throw error;
    }
  }

  /**
   * Sync offline queue with Firestore
   */
  async syncOfflineQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.notifySyncStatus('syncing');

    try {
      const queue = await offlineStorage.getQueue();
      
      if (queue.length === 0) {
        console.log('No items in offline queue');
        this.notifySyncStatus('idle');
        this.syncInProgress = false;
        return;
      }

      console.log(`Syncing ${queue.length} queued operations...`);

      // Sort by timestamp (oldest first)
      queue.sort((a, b) => a.timestamp - b.timestamp);

      let successCount = 0;
      let errorCount = 0;

      for (const item of queue) {
        try {
          await this.processQueueItem(item);
          await offlineStorage.removeFromQueue(item.id);
          successCount++;
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error);
          errorCount++;
          
          // Retry logic: remove if retried too many times
          if (item.retryCount >= 3) {
            console.warn(`Removing failed item after ${item.retryCount} retries:`, item);
            await offlineStorage.removeFromQueue(item.id);
          } else {
            // Increment retry count
            await offlineStorage.save(STORES.OFFLINE_QUEUE, {
              ...item,
              retryCount: item.retryCount + 1,
            });
          }
        }
      }

      console.log(`Sync complete: ${successCount} succeeded, ${errorCount} failed`);
      this.notifySyncStatus(errorCount > 0 ? 'error' : 'idle');
    } catch (error) {
      console.error('Error syncing offline queue:', error);
      this.notifySyncStatus('error');
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    switch (item.type) {
      case 'save_debt':
        await firestoreSaveDebtState(item.data as DebtState);
        break;
      
      case 'save_payment':
        await firestoreSavePayment(item.data as Omit<Payment, 'id'>);
        break;
      
      // Add other operation types as needed
      default:
        console.warn(`Unknown queue item type: ${item.type}`);
    }
  }

  /**
   * Get pending queue count
   */
  async getQueueCount(): Promise<number> {
    try {
      const queue = await offlineStorage.getQueue();
      return queue.length;
    } catch (error) {
      console.error('Error getting queue count:', error);
      return 0;
    }
  }

  /**
   * Clear all queued operations (use with caution)
   */
  async clearQueue(): Promise<void> {
    await offlineStorage.clearQueue();
    console.log('Offline queue cleared');
  }

  /**
   * Cleanup listeners
   */
  destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners.clear();
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
