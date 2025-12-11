import React, { createContext, useContext, useState, useEffect } from 'react';
import { userSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

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
      // Fetch user by email
      const { data: userData, error } = await userSupabase
        .from('users')
        .select('id, full_name, email, phone, password_hash')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Login query error:', error);
        return { success: false, error: 'Server error. Please try again.' };
      }

      if (!userData) {
        return { success: false, error: 'No account found with this email' };
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, userData.password_hash);
      if (!validPassword) {
        return { success: false, error: 'Incorrect password' };
      }

      const loggedInUser: User = {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone || '',
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
      // Check if user already exists
      const { data: existingUser } = await userSupabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Insert new user
      const { data: newUser, error: insertError } = await userSupabase
        .from('users')
        .insert({
          full_name: name,
          email: email.toLowerCase(),
          phone,
          password_hash,
        })
        .select('id, full_name, email, phone')
        .single();

      if (insertError) {
        console.error('Signup insert error:', insertError);
        return { success: false, error: 'Failed to create account. Please try again.' };
      }

      const createdUser: User = {
        id: newUser.id,
        name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone || '',
      };

      setUser(createdUser);
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

    const { error } = await userSupabase
      .from('users')
      .update({
        full_name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }

    setUser({
      ...user,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
    });

    return { success: true };
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    // Fetch current password hash
    const { data: userData, error: fetchError } = await userSupabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single();

    if (fetchError || !userData) {
      return { success: false, error: 'Failed to verify current password' };
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, userData.password_hash);
    if (!validPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    const { error: updateError } = await userSupabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', user.id);

    if (updateError) {
      return { success: false, error: 'Failed to update password' };
    }

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
