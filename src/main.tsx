import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { offlineStorage } from './services/offlineStorageService'
import { offlineSyncService } from './services/offlineSyncService'

// Initialize offline storage on app start
offlineStorage.init().then(() => {
  console.log('Offline storage initialized');
}).catch((err) => {
  console.error('Failed to initialize offline storage:', err);
});

// Register service worker for PWA offline support
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Notify user of update available
      console.log('New content available, reloading...');
      // Reload to get new version
      window.location.reload();
    },
    onOfflineReady() {
      console.log('App ready to work offline');
      // Show user-friendly notification
      if (Notification.permission === 'granted') {
        new Notification('RCBC Debt Tracker', {
          body: 'App is ready to work offline!',
          icon: '/logo-new.webp',
        });
      }
    },
  });
}

// Setup network status monitoring
window.addEventListener('online', () => {
  console.log('Network connection restored');
  // Trigger sync when coming back online
  offlineSyncService.syncOfflineQueue();
});

window.addEventListener('offline', () => {
  console.log('Network connection lost - app will work offline');
});

// Request notification permission for offline alerts
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().then((permission) => {
    console.log('Notification permission:', permission);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
