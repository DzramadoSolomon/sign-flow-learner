# Authentication System Guide

This document describes the localStorage-based authentication system for the GSL Learning platform.

## Overview

The authentication system allows users to:
- **Create an account** with name, email, phone number, and password
- **Login** using email and password
- **Logout** from the sidebar
- Access **protected routes** that require authentication

## How It Works

### Data Storage

All user data is stored in the browser's localStorage:

| Key | Description |
|-----|-------------|
| `gsl_users` | Object containing all registered users (keyed by email) |
| `gsl_current_user` | Currently logged-in user object |

### User Object Structure

```typescript
interface User {
  id: string;      // Unique UUID
  name: string;    // Full name
  email: string;   // Email address (lowercase)
  phone: string;   // Phone number
}
```

### Storage Format

```json
{
  "gsl_users": {
    "user@email.com": {
      "user": {
        "id": "uuid-here",
        "name": "John Doe",
        "email": "user@email.com",
        "phone": "+233 XX XXX XXXX"
      },
      "password": "hashedpassword"
    }
  },
  "gsl_current_user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "user@email.com",
    "phone": "+233 XX XXX XXXX"
  }
}
```

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx      # Auth state management & functions
├── components/
│   └── ProtectedRoute.tsx   # Route protection wrapper
├── pages/
│   └── Auth.tsx             # Login/Signup page
```

## Components

### AuthContext (`src/contexts/AuthContext.tsx`)

Provides authentication state and functions throughout the app:

```typescript
// Usage in any component
const { user, isAuthenticated, login, signup, logout } = useAuth();

// Login
const result = login('email@example.com', 'password');
if (result.success) {
  // Navigate to dashboard
} else {
  // Show result.error message
}

// Signup
const result = signup('John Doe', 'email@example.com', '+233...', 'password');

// Logout
logout();
```

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)

Wraps routes that require authentication:

```tsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Auth Page (`src/pages/Auth.tsx`)

Contains both login and signup forms in a tabbed interface.

**Login requires:**
- Email
- Password

**Signup requires:**
- Full Name
- Email
- Phone Number
- Password (min 6 characters)
- Confirm Password

## Routes

| Route | Protection | Description |
|-------|------------|-------------|
| `/auth` | Public | Login/Signup page |
| `/` | Protected | Homepage with mode selection |
| `/dashboard` | Protected | User dashboard |
| `/lessons` | Protected | All lessons page |
| `/lesson/:id` | Protected | Individual lesson page |

## Personalization

Once logged in, the user's name is displayed in:

1. **Dashboard Welcome Message**: "Welcome back, {First Name}!"
2. **Sidebar Footer**: Shows user initial and full name with logout button

## Validation

### Login Validation
- Email and password are required
- Checks if account exists
- Verifies password matches

### Signup Validation
- All fields are required
- Email must be unique (not already registered)
- Password must be at least 6 characters
- Password confirmation must match

## Error Handling

Error messages displayed via toast notifications:
- "No account found with this email. Please create an account."
- "Incorrect password. Please try again."
- "An account with this email already exists. Please login instead."
- "Passwords do not match."
- "Password must be at least 6 characters long."

## Logout

Users can logout by:
1. Clicking the logout icon in the sidebar footer
2. This clears `gsl_current_user` from localStorage
3. Redirects to `/auth` page

## Security Considerations

⚠️ **Important**: This is a localStorage-based authentication system intended for demo/prototype purposes.

**Current limitations:**
- Passwords are stored in plain text in localStorage
- No encryption or hashing
- No session expiration
- Data is accessible via browser developer tools

**For production, consider:**
- Using a proper backend with Supabase/Lovable Cloud
- Implementing password hashing
- Adding session management
- Using HTTPS
- Adding rate limiting

## Testing the Authentication

1. Open the app - you'll be redirected to `/auth`
2. Click "Create Account" tab
3. Fill in:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "+233 123 456 789"
   - Password: "password123"
   - Confirm Password: "password123"
4. Click "Create Account"
5. You'll be redirected to the homepage
6. Select a learning mode to go to dashboard
7. Dashboard shows "Welcome back, Test!"
8. Sidebar shows your name and logout button
9. Click logout to return to auth page
10. Login with email and password to verify

## Clearing Test Data

To reset all authentication data:

```javascript
// In browser console
localStorage.removeItem('gsl_users');
localStorage.removeItem('gsl_current_user');
```

Or clear all app data:
```javascript
localStorage.clear();
```
