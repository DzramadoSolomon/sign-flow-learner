import React, { createContext, useContext, useState, useEffect } from 'react';

// Lovable Cloud edge function URL (where the auth function is deployed)
const EDGE_FUNCTION_URL = 'https://njukrhmykrxqvjjvnotv.supabase.co/functions/v1/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (data: { name: string; email: string; phone: string }) => Promise<AuthResult>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'gsl_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    setIsLoading(false);
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error };
      }

      const userData: User = {
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone || '',
      };

      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', full_name: name, email, phone, password })
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error };
      }

      const userData: User = {
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone || '',
      };

      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Signup exception:', err);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (data: { name: string; email: string; phone: string }): Promise<AuthResult> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    // For now, just update locally - you can add a backend endpoint for this later
    const updatedUser: User = {
      ...user,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
    };

    setUser(updatedUser);
    return { success: true };
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    // For password updates, you would need to add another action to the edge function
    // For now, return success placeholder
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      signup, 
      logout, 
      updateProfile, 
      updatePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
