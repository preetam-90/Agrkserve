/**
 * Network Detection Utilities
 * Detects online/offline status and connection speed
 */

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink?: number; // Mbps
  rtt?: number; // Round-trip time in ms
  saveData: boolean; // User preference for reduced data
}

/**
 * Gets current network status
 */
export function getNetworkStatus(): NetworkStatus {
  if (typeof window === 'undefined') {
    return {
      isOnline: true,
      effectiveType: 'unknown',
      saveData: false,
    };
  }
  
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
  
  const status: NetworkStatus = {
    isOnline: navigator.onLine,
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData || false,
  };
  
  return status;
}

/**
 * Checks if connection is slow
 */
export function isSlowConnection(): boolean {
  const status = getNetworkStatus();
  
  if (!status.isOnline) return false;
  
  // Consider 2g and slow-2g as slow
  if (status.effectiveType === '2g' || status.effectiveType === 'slow-2g') {
    return true;
  }
  
  // Consider connections with high RTT as slow
  if (status.rtt && status.rtt > 500) {
    return true;
  }
  
  // Consider connections with low downlink as slow
  if (status.downlink && status.downlink < 1) {
    return true;
  }
  
  return false;
}

/**
 * Checks if device is offline
 */
export function isOffline(): boolean {
  if (typeof window === 'undefined') return false;
  return !navigator.onLine;
}

/**
 * Adds event listeners for network status changes
 */
export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Implements exponential backoff for retries
 */
export function exponentialBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return delay + jitter;
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry if offline
      if (isOffline()) {
        throw new Error('Device is offline');
      }
      
      // Don't retry on last attempt
      if (attempt === maxAttempts - 1) {
        break;
      }
      
      // Wait before retrying
      const delay = exponentialBackoff(attempt, baseDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Max retry attempts reached');
}
