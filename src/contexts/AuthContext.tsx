import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

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

  // Listen for Supabase auth state changes (for Google OAuth)
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          // Google OAuth user - set user from Supabase session
          const oauthUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            phone: session.user.phone || '',
          };
          setUser(oauthUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(oauthUser));
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(CURRENT_USER_KEY);
          setIsLoading(false);
        }
      }
    );

    // Handle OAuth callback - check for code in URL
    const handleOAuthCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      
      if (code) {
        console.log('OAuth code detected, exchanging for session...');
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
          } else {
            console.log('Session established:', data.user?.email);
          }
          // Clean the URL after processing
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('OAuth callback error:', err);
        }
        return; // Let onAuthStateChange handle the user update
      }
      
      // No OAuth code - check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const oauthUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phone: session.user.phone || '',
        };
        setUser(oauthUser);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(oauthUser));
      } else {
        // Fall back to localStorage for custom auth
        try {
          const saved = localStorage.getItem(CURRENT_USER_KEY);
          if (saved) {
            setUser(JSON.parse(saved));
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
      setIsLoading(false);
    };

    handleOAuthCallback();

    return () => subscription.unsubscribe();
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
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { action: 'login', email, password }
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please check your connection.' };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const loggedInUser: User = {
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone || '',
      };

      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { action: 'signup', full_name: name, email, phone, password }
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, error: 'Network error. Please check your connection.' };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      const createdUser: User = {
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone || '',
      };

      setUser(createdUser);
      return { success: true };
    } catch (err) {
      console.error('Signup exception:', err);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const logout = async () => {
    // Sign out from Supabase (for Google OAuth users)
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = async (data: { name: string; email: string; phone: string }): Promise<AuthResult> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { data: responseData, error } = await supabase.functions.invoke('auth', {
        body: { 
          action: 'update_profile', 
          user_id: user.id, 
          profile_data: data 
        }
      });

      if (error) {
        console.error('Update profile error:', error);
        return { success: false, error: 'Failed to update profile' };
      }

      if (!responseData.success) {
        return { success: false, error: responseData.error || 'Failed to update profile' };
      }

      setUser({
        ...user,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
      });

      return { success: true };
    } catch (err) {
      console.error('Update profile exception:', err);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { 
          action: 'update_password', 
          user_id: user.id, 
          current_password: currentPassword, 
          new_password: newPassword 
        }
      });

      if (error) {
        console.error('Update password error:', error);
        return { success: false, error: 'Failed to update password' };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to update password' };
      }

      return { success: true };
    } catch (err) {
      console.error('Update password exception:', err);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
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
