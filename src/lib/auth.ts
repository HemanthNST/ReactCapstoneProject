/**
 * Authentication utility functions for client-side auth checks
 */

/**
 * Check if user is authenticated by verifying session cookie
 * @returns Promise<boolean> - true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });
    
    return response.ok && response.status === 200;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

/**
 * Check authentication and redirect to steps page if authenticated
 * This should be called in useEffect hooks for login/register pages
 */
export async function redirectIfAuthenticated() {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    window.location.href = '/steps';
  }
}

/**
 * Check authentication and redirect to login if not authenticated
 * This should be called in useEffect hooks for protected pages
 */
export async function redirectIfNotAuthenticated() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    window.location.href = '/login';
  }
}
