import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * AuthGate handles the root route behavior:
 * - Shows loading while auth is being determined
 * - Redirects to dashboard if authenticated
 * - Redirects to auth if not authenticated
 * This prevents OAuth callbacks from being interrupted by premature redirects.
 */
export const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth" replace />;
};
