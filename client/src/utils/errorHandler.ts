/**
 * Global error handler for URI and other errors
 * Prevents errors from crashing the application
 */

/**
 * Safely decode a URI component
 * Returns the decoded string or the original if decoding fails
 */
export function safeDecodeURIComponent(uri: string): string {
  try {
    return decodeURIComponent(uri);
  } catch (error) {
    console.warn(`Failed to decode URI component: ${uri.substring(0, 100)}`);
    return uri;
  }
}

/**
 * Safely decode a URI
 * Returns the decoded string or the original if decoding fails
 */
export function safeDecodeURI(uri: string): string {
  try {
    return decodeURI(uri);
  } catch (error) {
    console.warn(`Failed to decode URI: ${uri.substring(0, 100)}`);
    return uri;
  }
}

/**
 * Safely encode a URI component
 * Returns the encoded string or the original if encoding fails
 */
export function safeEncodeURIComponent(uri: string): string {
  try {
    return encodeURIComponent(uri);
  } catch (error) {
    console.warn(`Failed to encode URI component: ${uri.substring(0, 100)}`);
    return uri;
  }
}

/**
 * Validate and sanitize a URL
 * Returns a safe URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
  try {
    // Remove any malformed percent encoding
    let sanitized = url.replace(/%[^0-9A-F]/gi, '');
    
    // Try to decode and re-encode to validate
    try {
      decodeURIComponent(sanitized);
    } catch {
      // If decode fails, try to fix common issues
      sanitized = sanitized.replace(/%/g, '');
    }
    
    // Ensure it's a valid path or URL
    if (sanitized.startsWith('/') || sanitized.startsWith('http://') || sanitized.startsWith('https://')) {
      return sanitized;
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to sanitize URL: ${url.substring(0, 100)}`);
    return null;
  }
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window !== 'undefined') {
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      if (event.error?.message?.includes('URI malformed') || 
          event.error?.message?.includes('decodeURI')) {
        console.warn('[Global] Suppressed URI error:', event.error.message);
        event.preventDefault();
        return false;
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('URI malformed') || 
          event.reason?.message?.includes('decodeURI')) {
        console.warn('[Global] Suppressed URI error in promise:', event.reason.message);
        event.preventDefault();
        return false;
      }
    });
  }
}

