import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Admin emails that bypass payment requirements
const ADMIN_EMAILS = ['solomonkendzramado@gmail.com'];

export const usePurchasedLevels = () => {
  const { user } = useAuth();
  const [purchasedLevels, setPurchasedLevels] = useState<string[]>([]);
  const [purchasedLessonIds, setPurchasedLessonIds] = useState<string[]>([]);
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
        setPurchasedLessonIds([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('lesson_purchases')
        .select('lesson_id')
        .eq('user_email', userEmail.toLowerCase())
        .eq('payment_status', 'success');

      if (error) {
        console.error('Error fetching purchases:', error);
        setPurchasedLevels([]);
        setPurchasedLessonIds([]);
        setIsLoading(false);
        return;
      }

      // Track individual lesson IDs
      const lessonIds: string[] = [];
      // Extract levels from purchased lesson IDs (e.g., 'intermediate-1' -> 'intermediate')
      const levels = new Set<string>();
      
      if (data) {
        data.forEach((p) => {
          const lessonId = (p as { lesson_id: string }).lesson_id;
          lessonIds.push(lessonId);
          const level = lessonId.split('-')[0];
          if (level) levels.add(level);
        });
      }

      setPurchasedLessonIds(lessonIds);
      setPurchasedLevels(Array.from(levels));
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setPurchasedLevels([]);
      setPurchasedLessonIds([]);
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

  const hasLessonAccess = useCallback((lessonId: string) => {
    // Admins have access to all lessons
    if (isAdmin) return true;
    // Beginner lessons are always free
    if (lessonId.toLowerCase().startsWith('beginner')) return true;
    // Check if this specific lesson was purchased
    if (purchasedLessonIds.includes(lessonId)) return true;
    // Check if any lesson in the same level was purchased (unlocks all in level)
    const level = lessonId.split('-')[0]?.toLowerCase();
    return purchasedLevels.includes(level);
  }, [purchasedLessonIds, purchasedLevels, isAdmin]);

  const isLessonPurchased = useCallback((lessonId: string) => {
    // Check if this specific lesson was purchased (for showing badge)
    return purchasedLessonIds.includes(lessonId);
  }, [purchasedLessonIds]);

  const refetch = fetchPurchasedLevels;

  return {
    purchasedLevels,
    purchasedLessonIds,
    isLoading,
    hasLevelAccess,
    hasLessonAccess,
    isLessonPurchased,
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
