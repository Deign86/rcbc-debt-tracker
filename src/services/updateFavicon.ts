import { storageService } from '../services/storageService';

/**
 * Updates the favicon dynamically from Firebase Storage
 */
export async function updateFavicon(): Promise<void> {
  try {
    const faviconUrl = await storageService.getFaviconUrl();
    
    // Update all favicon link elements
    const faviconElements = document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"]'
    );
    
    faviconElements.forEach((element) => {
      element.href = faviconUrl;
    });

    // If no favicon exists, create one
    if (faviconElements.length === 0) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = faviconUrl;
      document.head.appendChild(link);
    }

    console.log('Favicon updated from Firebase Storage');
  } catch (error) {
    console.error('Failed to update favicon:', error);
  }
}
