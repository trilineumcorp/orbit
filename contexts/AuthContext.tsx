import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';
import * as authService from '@/services/auth';
import { registerForPushNotificationsAsync, sendPushTokenToBackend } from '@/services/notifications';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: { rollNumber?: string; class?: string }
  ) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Safety timeout - always stop loading after 3 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn('AuthContext: Safety timeout - stopping loading state');
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(safetyTimeout);
  }, []);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          sendPushTokenToBackend(token);
        }
      });
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      // Add timeout to prevent hanging - reduced to 2 seconds
      const authPromise = authService.getCurrentUser();
      const timeoutPromise = new Promise<User | null>((resolve) =>
        setTimeout(() => {
          console.warn('AuthContext: Auth check timeout - continuing without user');
          resolve(null);
        }, 2000)
      );

      const currentUser = await Promise.race([authPromise, timeoutPromise]);
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Starting login for:', email);
      const loggedInUser = await authService.login(email, password);
      console.log('AuthContext: Login service returned:', loggedInUser);

      if (loggedInUser) {
        setUser(loggedInUser);
        console.log('AuthContext: User state set to:', loggedInUser);

        // Verify the user was stored correctly
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for AsyncStorage
        const verifyUser = await authService.getCurrentUser();
        console.log('AuthContext: Verified user from storage:', verifyUser);

        if (!verifyUser) {
          throw new Error('Failed to save login session');
        }

        // Ensure state is updated
        if (verifyUser.id !== loggedInUser.id) {
          setUser(verifyUser);
        }

        return verifyUser;
      } else {
        throw new Error('Login failed - no user returned');
      }
    } catch (error: any) {
      console.error('Login error in context:', error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    additionalData?: { rollNumber?: string; class?: string }
  ) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(email, password, name, role, additionalData);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateUser(userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    role: user?.role || null,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

