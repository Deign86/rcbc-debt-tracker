/**
 * Network status hook
 * Tracks online/offline status and provides sync capabilities
 */

import { useState, useEffect } from 'react';
import { offlineSyncService, type SyncStatus } from '@/services/offlineSyncService';

export interface NetworkStatus {
  isOnline: boolean;
  syncStatus: SyncStatus;
  queueCount: number;
  sync: () => Promise<void>;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    // Setup online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync status changes
    const unsubscribe = offlineSyncService.onSyncStatusChange(setSyncStatus);

    // Update queue count periodically
    const updateQueueCount = async () => {
      const count = await offlineSyncService.getQueueCount();
      setQueueCount(count);
    };

    updateQueueCount();
    const interval = setInterval(updateQueueCount, 5000); // Update every 5 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const sync = async () => {
    await offlineSyncService.syncOfflineQueue();
    const count = await offlineSyncService.getQueueCount();
    setQueueCount(count);
  };

  return {
    isOnline,
    syncStatus,
    queueCount,
    sync,
  };
};
