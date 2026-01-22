/**
 * Offline indicator component
 * Shows connection status and sync information
 */

import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const { isOnline, syncStatus, queueCount, sync } = useNetworkStatus();

  if (isOnline && queueCount === 0 && syncStatus === 'idle') {
    return null; // Don't show anything when everything is fine
  }

  return (
    <div
      className={cn(
        // Position above mobile nav (16px height + 8px gap) on mobile, regular bottom on desktop
        'fixed bottom-20 left-4 right-4 z-40 rounded-lg shadow-lg border px-4 py-2.5 flex items-center justify-between',
        'lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-md lg:py-3',
        'transition-all duration-200',
        !isOnline && 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700',
        isOnline && syncStatus === 'syncing' && 'bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40',
        isOnline && syncStatus === 'error' && 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {!isOnline && (
            <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          )}
          {isOnline && syncStatus === 'syncing' && (
            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          )}
          {isOnline && syncStatus === 'error' && (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
          {isOnline && syncStatus === 'idle' && queueCount > 0 && (
            <Wifi className="h-5 w-5 text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {!isOnline && (
            <>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Offline Mode
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate">
                {queueCount > 0 
                  ? `${queueCount} change${queueCount === 1 ? '' : 's'} pending sync`
                  : 'Changes will sync when online'
                }
              </p>
            </>
          )}
          
          {isOnline && syncStatus === 'syncing' && (
            <>
              <p className="text-sm font-medium text-primary">
                Syncing...
              </p>
              <p className="text-xs text-primary/70 truncate">
                {queueCount > 0 && `${queueCount} change${queueCount === 1 ? '' : 's'} remaining`}
              </p>
            </>
          )}
          
          {isOnline && syncStatus === 'error' && (
            <>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Sync Error
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 truncate">
                Some changes failed to sync
              </p>
            </>
          )}
          
          {isOnline && syncStatus === 'idle' && queueCount > 0 && (
            <>
              <p className="text-sm font-medium text-primary">
                Ready to sync
              </p>
              <p className="text-xs text-primary/70 truncate">
                {queueCount} change{queueCount === 1 ? '' : 's'} pending
              </p>
            </>
          )}
        </div>
      </div>

      {isOnline && queueCount > 0 && syncStatus !== 'syncing' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={sync}
          className="ml-2 flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Sync</span>
        </Button>
      )}
    </div>
  );
};
