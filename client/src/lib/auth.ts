// Authentication utilities for client-side

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Token management
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const storeAuth = (token: string, user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Token validation
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
};

// API request with automatic token refresh
export const apiRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    // Try to refresh token
    try {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry with new token
        return apiRequest(url, options);
      } else {
        // Refresh failed, redirect to login
        clearAuth();
        window.location.href = '/auth/login';
        throw new Error('Token expired and refresh failed');
      }
    } catch (error) {
      clearAuth();
      window.location.href = '/auth/login';
      throw error;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If token is invalid, try to refresh
  if (response.status === 401) {
    try {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry with new token
        return apiRequest(url, options);
      } else {
        clearAuth();
        window.location.href = '/auth/login';
        throw new Error('Authentication failed');
      }
    } catch (error) {
      clearAuth();
      window.location.href = '/auth/login';
      throw error;
    }
  }

  return response;
};

// Token refresh
export const refreshToken = async (): Promise<boolean> => {
  try {
    const token = getStoredToken();
    if (!token) return false;

    const response = await fetch('http://localhost:5000/api/users/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      storeAuth(data.token, data.user);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Logout with API call
export const logout = async (): Promise<void> => {
  try {
    const token = getStoredToken();
    if (token) {
      await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
  }
};

// Check authentication status
export const checkAuth = (): AuthState => {
  const token = getStoredToken();
  const user = getStoredUser();
  
  if (!token || !user || isTokenExpired(token)) {
    clearAuth();
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  return {
    user,
    token,
    isAuthenticated: true,
  };
};

// Auto-refresh token before expiration
export const setupTokenRefresh = (): void => {
  const token = getStoredToken();
  if (!token) return;

  const expiration = getTokenExpiration(token);
  if (!expiration) return;

  // Refresh token 5 minutes before expiration
  const refreshTime = expiration - (5 * 60 * 1000);
  const timeUntilRefresh = refreshTime - Date.now();

  if (timeUntilRefresh > 0) {
    setTimeout(async () => {
      await refreshToken();
      setupTokenRefresh(); // Set up next refresh
    }, timeUntilRefresh);
  }
};
