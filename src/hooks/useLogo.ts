import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

/**
 * Hook to fetch and manage logo URL from Firebase Storage
 */
export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string>('/assets/logo-transparent-fixed.png');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const url = await storageService.getLogoUrl();
        setLogoUrl(url);
      } catch (error) {
        console.error('Failed to load logo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return { logoUrl, loading };
};
