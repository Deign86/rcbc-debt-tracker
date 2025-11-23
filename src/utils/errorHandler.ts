/**
 * Centralized error handling utility
 * Provides consistent error notifications across the app
 */

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorOptions {
  severity?: ErrorSeverity;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Display a user-friendly error message
 */
export function showError(
  error: unknown,
  fallbackMessage: string = 'An error occurred',
  options: ErrorOptions = {}
): void {
  const { severity = 'error' } = options;
  
  let message = fallbackMessage;
  
  // Extract meaningful error message
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String((error as any).message);
  }

  // Map Firebase/Firestore errors to user-friendly messages
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as any).code;
    switch (code) {
      case 'permission-denied':
        message = 'Permission denied. Please check your connection and try again.';
        break;
      case 'unavailable':
        message = 'Network unavailable. Please check your internet connection.';
        break;
      case 'not-found':
        message = 'Data not found. Please try refreshing the page.';
        break;
      case 'already-exists':
        message = 'This item already exists.';
        break;
      case 'unauthenticated':
        message = 'Authentication required. Please log in again.';
        break;
    }
  }

  // Log to console for debugging
  if (severity === 'error') {
    console.error(fallbackMessage, error);
  } else if (severity === 'warning') {
    console.warn(fallbackMessage, error);
  }

  // Show user notification (fallback to alert for now, can be upgraded to toast)
  if (typeof window !== 'undefined' && severity !== 'info') {
    alert(message);
  }
}

/**
 * Handle async operations with consistent error handling
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  options: ErrorOptions = {}
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    showError(error, errorMessage, options);
    return null;
  }
}

/**
 * Extract a safe error message for logging
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return 'Unknown error';
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  
  const code = (error as any).code;
  return code === 'unavailable' || code === 'network-error' || code === 'offline';
}

/**
 * Check if an error is a quota/storage error
 */
export function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  
  const name = (error as any)?.name;
  const code = (error as any)?.code;
  
  return name === 'QuotaExceededError' || code === 22;
}
