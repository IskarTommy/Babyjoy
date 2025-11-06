import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  role?: string;
  role_display?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPermissionsWithToken = async (authToken: string): Promise<void> => {
    try {
      const response = await fetch('/api/users/permissions/', {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const permissionData = await response.json();
        setUser(currentUser => {
          if (!currentUser) return null;
          const updatedUser = {
            ...currentUser,
            role: permissionData.role,
            role_display: permissionData.role_display,
            permissions: permissionData.permissions,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (error) {
      console.error('Error refreshing permissions:', error);
    }
  };

  useEffect(() => {
    // Check for existing token on app start
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // If user doesn't have permissions, refresh them
        if (!parsedUser.permissions || parsedUser.permissions.length === 0) {
          console.log('Refreshing permissions on app load...');
          refreshPermissionsWithToken(savedToken);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, received data:', { token: data.token ? 'present' : 'missing', user: data.user });
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // If user doesn't have permissions, refresh them
        if (!data.user.permissions || data.user.permissions.length === 0) {
          console.log('User permissions not found, refreshing...');
          await refreshPermissionsWithToken(data.token);
        } else {
          console.log('User permissions loaded:', data.user.permissions);
        }
        
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permissions?.includes(permission) || false;
  };

  const refreshPermissions = async (): Promise<void> => {
    if (!token) return;
    await refreshPermissionsWithToken(token);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
    hasPermission,
    refreshPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};