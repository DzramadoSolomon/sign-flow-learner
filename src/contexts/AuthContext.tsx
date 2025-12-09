import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, phone: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: { name: string; email: string; phone: string }) => { success: boolean; error?: string };
  updatePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'gsl_users';
const CURRENT_USER_KEY = 'gsl_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const getStoredUsers = (): { [email: string]: { user: User; password: string } } => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const saveUser = (userData: User, password: string) => {
    const users = getStoredUsers();
    users[userData.email.toLowerCase()] = { user: userData, password };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users = getStoredUsers();
    const userRecord = users[email.toLowerCase()];

    if (!userRecord) {
      return { success: false, error: 'No account found with this email. Please create an account.' };
    }

    if (userRecord.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setUser(userRecord.user);
    return { success: true };
  };

  const signup = (name: string, email: string, phone: string, password: string): { success: boolean; error?: string } => {
    const users = getStoredUsers();
    
    if (users[email.toLowerCase()]) {
      return { success: false, error: 'An account with this email already exists. Please login instead.' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      phone,
    };

    saveUser(newUser, password);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: { name: string; email: string; phone: string }): { success: boolean; error?: string } => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    const users = getStoredUsers();
    const currentEmail = user.email.toLowerCase();
    const newEmail = data.email.toLowerCase();

    // Check if new email is already taken by another user
    if (newEmail !== currentEmail && users[newEmail]) {
      return { success: false, error: 'This email is already in use by another account' };
    }

    // Get current password
    const currentRecord = users[currentEmail];
    if (!currentRecord) {
      return { success: false, error: 'User record not found' };
    }

    // Update user data
    const updatedUser: User = {
      ...user,
      name: data.name,
      email: newEmail,
      phone: data.phone,
    };

    // If email changed, remove old entry
    if (newEmail !== currentEmail) {
      delete users[currentEmail];
    }

    // Save updated user
    users[newEmail] = { user: updatedUser, password: currentRecord.password };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    setUser(updatedUser);

    return { success: true };
  };

  const updatePassword = (currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    const users = getStoredUsers();
    const userRecord = users[user.email.toLowerCase()];

    if (!userRecord) {
      return { success: false, error: 'User record not found' };
    }

    if (userRecord.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password
    userRecord.password = newPassword;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile, updatePassword }}>
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
