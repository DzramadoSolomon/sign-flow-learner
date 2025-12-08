# Firebase Integration Guide

This guide explains how to migrate the current localStorage-based authentication system to Firebase for persistent cloud storage.

## Current System Overview

The app currently uses **localStorage** for authentication:

| Component | File | Purpose |
|-----------|------|---------|
| AuthContext | `src/contexts/AuthContext.tsx` | Manages auth state, login, signup, logout |
| Auth Page | `src/pages/Auth.tsx` | Login/Signup UI forms |
| ProtectedRoute | `src/components/ProtectedRoute.tsx` | Guards routes requiring auth |

### Current Storage Keys
- `gsl_users` - All registered users (email → user data + password)
- `gsl_current_user` - Currently logged-in user

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "gsl-learning")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get Started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click "Save"

### Step 3: Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

### Step 4: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (`</>`)
4. Register app with a nickname
5. Copy the `firebaseConfig` object

---

## Installation

Install Firebase SDK in your project:

```bash
npm install firebase
```

---

## Implementation

### Step 1: Create Firebase Config File

Create `src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Step 2: Update AuthContext

Replace `src/contexts/AuthContext.tsx` with Firebase authentication:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (
    name: string, 
    email: string, 
    phone: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userData: User = {
        id: userCredential.user.uid,
        name,
        email: email.toLowerCase(),
        phone,
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      setUser(userData);
      
      return { success: true };
    } catch (error: any) {
      // Handle Firebase errors
      let errorMessage = 'An error occurred during signup.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user profile
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      }
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'An error occurred during login.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
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
```

### Step 3: Update Auth Page for Async Functions

The current `Auth.tsx` uses synchronous functions. Update the handlers:

```typescript
// Change from:
const result = login(email, password);

// To:
const result = await login(email, password);

// Make the handler async:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const result = await login(email, password);
  // ... rest of logic
};
```

---

## Firestore Security Rules

Set up security rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Database Structure

### Users Collection

```
users/
  {userId}/
    id: string
    name: string
    email: string
    phone: string
    createdAt: timestamp (optional)
```

### Future: Progress Collection (Optional)

```
progress/
  {progressId}/
    userId: string
    lessonId: string
    completed: boolean
    quizScore: number
    lastAccessed: timestamp
```

---

## Adding Firebase Storage (For Files/Images)

### Step 1: Enable Storage

1. Go to **Build → Storage** in Firebase Console
2. Click "Get Started"
3. Choose security rules (start in test mode for development)
4. Select location

### Step 2: Update Firebase Config

```typescript
// In src/lib/firebase.ts
import { getStorage } from 'firebase/storage';

// Add after other exports
export const storage = getStorage(app);
```

### Step 3: Upload Files

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

// Usage:
const url = await uploadFile(imageFile, `avatars/${userId}`);
```

---

## Migration Steps Summary

1. ✅ Install Firebase: `npm install firebase`
2. ✅ Create `src/lib/firebase.ts` with your config
3. ✅ Replace `AuthContext.tsx` with Firebase version
4. ✅ Update `Auth.tsx` handlers to be async
5. ✅ Set up Firestore security rules
6. ✅ Test signup/login flow
7. ✅ Remove localStorage code after confirming Firebase works

---

## Environment Variables (Optional)

For security, store Firebase config in environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then in `firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Firebase app not initialized" | Check config is correct and `initializeApp` is called |
| "Permission denied" | Check Firestore security rules |
| Login works but user is null | Ensure `getDoc` is fetching from correct collection |
| Signup fails silently | Check browser console for Firebase error codes |

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Web Guide](https://firebase.google.com/docs/auth/web/start)
- [Firestore Web Guide](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage/web/start)
