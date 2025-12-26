import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Admin emails that bypass payment requirements
const ADMIN_EMAILS = ['solomonkendzramado@gmail.com'];

export const usePurchasedLevels = () => {
  const { user } = useAuth();
  const [purchasedLevels, setPurchasedLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user is an admin (bypasses payment)
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  const fetchPurchasedLevels = useCallback(async () => {
    try {
      let userEmail = user?.email;
      
      if (!userEmail) {
        userEmail = sessionStorage.getItem('lastPaymentEmail') || undefined;
      }

      if (!userEmail) {
        setPurchasedLevels([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('lesson_purchases')
        .select('lesson_id')
        .eq('user_email', userEmail)
        .eq('payment_status', 'success');

      if (error) {
        console.error('Error fetching purchases:', error);
        setPurchasedLevels([]);
        setIsLoading(false);
        return;
      }

      // Extract levels from purchased lesson IDs (e.g., 'intermediate-1' -> 'intermediate')
      const levels = new Set<string>();
      if (data) {
        data.forEach((p) => {
          const lessonId = (p as { lesson_id: string }).lesson_id;
          const level = lessonId.split('-')[0];
          if (level) levels.add(level);
        });
      }

      setPurchasedLevels(Array.from(levels));
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setPurchasedLevels([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchPurchasedLevels();
  }, [fetchPurchasedLevels]);

  const hasLevelAccess = useCallback((level: string) => {
    // Admins have access to all levels
    if (isAdmin) return true;
    // Beginner is always free
    if (level.toLowerCase() === 'beginner') return true;
    return purchasedLevels.includes(level.toLowerCase());
  }, [purchasedLevels, isAdmin]);

  const refetch = fetchPurchasedLevels;

  return {
    purchasedLevels,
    isLoading,
    hasLevelAccess,
    refetch,
    isAdmin,
  };
};

/**
 * Get the display price for a lesson level.
 * 
 * These are the PRODUCTION prices shown to users.
 * For testing, the actual charge can be overridden via VITE_PAYSTACK_TEST_AMOUNT_GHS
 * in the .env file (see PaymentDialog.tsx for override logic).
 * 
 * @param level - The lesson level (beginner, intermediate, advanced)
 * @returns Price in Ghana Cedis (GH₵)
 */
export const getLevelPrice = (level: string): number => {
  if (level.toLowerCase() === 'intermediate') return 10;  // GH₵10
  if (level.toLowerCase() === 'advanced') return 15;      // GH₵15
  return 0;  // Beginner is free
};
