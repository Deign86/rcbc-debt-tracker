import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Storage service for managing assets in Firebase Storage
 */
class StorageService {
  private logoUrlCache: string | null = null;
  private faviconUrlCache: string | null = null;

  /**
   * Get the logo URL from Firebase Storage
   */
  async getLogoUrl(): Promise<string> {
    if (this.logoUrlCache) {
      return this.logoUrlCache;
    }

    try {
      const logoRef = ref(storage, 'assets/logo.png');
      this.logoUrlCache = await getDownloadURL(logoRef);
      return this.logoUrlCache;
    } catch (error) {
      console.error('Error fetching logo from Firebase Storage:', error);
      // Fallback to local transparent asset
      return '/assets/logo-transparent-fixed.png';
    }
  }

  /**
   * Get the favicon URL from Firebase Storage
   */
  async getFaviconUrl(): Promise<string> {
    if (this.faviconUrlCache) {
      return this.faviconUrlCache;
    }

    try {
      const faviconRef = ref(storage, 'assets/favicon.png');
      this.faviconUrlCache = await getDownloadURL(faviconRef);
      return this.faviconUrlCache;
    } catch (error) {
      console.error('Error fetching favicon from Firebase Storage:', error);
      // Fallback to local transparent asset
      return '/assets/logo-transparent-fixed.png';
    }
  }

  /**
   * Get icon URL for PWA manifest
   */
  async getIconUrl(size: '192' | '512'): Promise<string> {
    try {
      const iconRef = ref(storage, `assets/icon-${size}.png`);
      return await getDownloadURL(iconRef);
    } catch (error) {
      console.error(`Error fetching icon-${size} from Firebase Storage:`, error);
      // Fallback to local transparent asset
      return `/assets/logo-transparent-fixed.png`;
    }
  }

  /**
   * Clear cached URLs (useful for forcing refresh)
   */
  clearCache(): void {
    this.logoUrlCache = null;
    this.faviconUrlCache = null;
  }
}

export const storageService = new StorageService();
