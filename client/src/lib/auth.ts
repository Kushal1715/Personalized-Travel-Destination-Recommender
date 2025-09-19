export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }
};

// User management
export const userManager = {
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
  }
};

// API request helper
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = tokenManager.getToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  // Handle token expiration
  if (response.status === 401) {
    tokenManager.removeToken();
    userManager.removeUser();
    
    // Redirect to login if not already there
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login';
    }
  }

  return response;
};

// Auth state management
export const authState = {
  getInitialState: (): AuthState => {
    const token = tokenManager.getToken();
    const user = userManager.getUser();
    
    return {
      user,
      token,
      isAuthenticated: !!(token && user)
    };
  },

  setAuthState: (user: User, token: string): AuthState => {
    tokenManager.setToken(token);
    userManager.setUser(user);
    
    return {
      user,
      token,
      isAuthenticated: true
    };
  },

  clearAuthState: (): AuthState => {
    tokenManager.removeToken();
    userManager.removeUser();
    
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  }
};

// Role checking utilities
export const roleUtils = {
  hasRole: (user: User | null, role: string): boolean => {
    return user?.role === role;
  },

  isAdmin: (user: User | null): boolean => {
    return roleUtils.hasRole(user, 'admin');
  },

  isUser: (user: User | null): boolean => {
    return roleUtils.hasRole(user, 'user');
  },

  canAccess: (user: User | null, requiredRole?: string): boolean => {
    if (!user) return false;
    if (!requiredRole) return true;
    return roleUtils.hasRole(user, requiredRole);
  }
};

// Auth validation
export const authValidation = {
  isTokenValid: (token: string): boolean => {
    if (!token) return false;
    
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check if token is expired
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  validateUser: (user: User | null): boolean => {
    if (!user) return false;
    
    return !!(
      user.id &&
      user.name &&
      user.email &&
      user.isActive !== false
    );
  }
};

// Auth persistence
export const authPersistence = {
  save: (user: User, token: string): void => {
    authState.setAuthState(user, token);
  },

  load: (): AuthState => {
    return authState.getInitialState();
  },

  clear: (): void => {
    authState.clearAuthState();
  },

  isPersisted: (): boolean => {
    const state = authState.getInitialState();
    return state.isAuthenticated && authValidation.validateUser(state.user);
  }
};