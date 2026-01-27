/**
 * Error Logger Utility
 * Logs errors without exposing stack traces to users
 */

export interface ErrorLogEntry {
  timestamp: Date;
  errorCode: string;
  errorMessage: string;
  userId?: string;
  sessionId: string;
  userAgent: string;
  url: string;
  referrer?: string;
  networkStatus: 'online' | 'offline' | 'slow';
  deviceInfo: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
  };
  additionalContext?: Record<string, unknown>;
}

/**
 * Detects device type based on user agent
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Detects OS from user agent
 */
function getOS(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  
  if (ua.indexOf('Win') !== -1) return 'Windows';
  if (ua.indexOf('Mac') !== -1) return 'MacOS';
  if (ua.indexOf('Linux') !== -1) return 'Linux';
  if (ua.indexOf('Android') !== -1) return 'Android';
  if (ua.indexOf('iOS') !== -1 || ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) return 'iOS';
  
  return 'unknown';
}

/**
 * Detects browser from user agent
 */
function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  
  if (ua.indexOf('Firefox') !== -1) return 'Firefox';
  if (ua.indexOf('Chrome') !== -1) return 'Chrome';
  if (ua.indexOf('Safari') !== -1) return 'Safari';
  if (ua.indexOf('Edge') !== -1) return 'Edge';
  if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR') !== -1) return 'Opera';
  
  return 'unknown';
}

/**
 * Gets network status
 */
function getNetworkStatus(): 'online' | 'offline' | 'slow' {
  if (typeof window === 'undefined') return 'online';
  
  if (!navigator.onLine) return 'offline';
  
  // Check connection quality if available
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'slow';
    }
  }
  
  return 'online';
}

/**
 * Generates a session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  
  let sessionId = sessionStorage.getItem('agriServeSessionId');
  
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('agriServeSessionId', sessionId);
  }
  
  return sessionId;
}

/**
 * Logs an error without exposing stack traces to users
 */
export function logError(
  errorCode: string,
  errorMessage: string,
  additionalContext?: Record<string, unknown>
): void {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  try {
    const errorLog: ErrorLogEntry = {
      timestamp: new Date(),
      errorCode,
      errorMessage,
      sessionId: getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer || undefined,
      networkStatus: getNetworkStatus(),
      deviceInfo: {
        type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
      },
      additionalContext,
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Error Logger]', errorLog);
    }
    
    // In production, send to external logging service
    // Example: Sentry, LogRocket, etc.
    // This is a placeholder for integration
    try {
      // TODO: Integrate with external logging service
      // Example: Sentry.captureException(errorLog);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  } catch (error) {
    // Silently fail if logging fails
    console.error('Error in logError:', error);
  }
}

/**
 * Sanitizes error message to remove technical details
 */
export function sanitizeErrorMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  
  // Remove file paths, line numbers, and stack traces
  return message
    .replace(/at\s+.*\s+\(.*:\d+:\d+\)/g, '')
    .replace(/\s+at\s+.*/g, '')
    .replace(/file:\/\/.*:\d+:\d+/g, '')
    .replace(/https?:\/\/.*:\d+:\d+/g, '')
    .trim();
}
