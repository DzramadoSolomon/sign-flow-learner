import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useLessonCompletions() {
  const { user } = useAuth();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompletions = useCallback(async () => {
    try {
      let userEmail = user?.email;
      
      if (!userEmail) {
        userEmail = sessionStorage.getItem('lastPaymentEmail') || undefined;
      }

      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('user_email', userEmail);

      if (error) {
        console.error('Error fetching completions:', error);
        setIsLoading(false);
        return;
      }

      const lessonIds = data?.map((c: { lesson_id: string }) => c.lesson_id) || [];
      setCompletedLessonIds(lessonIds);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching completions:', err);
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  const isLessonCompleted = useCallback((lessonId: string) => {
    return completedLessonIds.includes(lessonId);
  }, [completedLessonIds]);

  const markLessonComplete = useCallback(async (lessonId: string) => {
    const userEmail = user?.email;
    
    if (!userEmail) {
      console.error('No user email available');
      return false;
    }

    // Check if already completed
    if (completedLessonIds.includes(lessonId)) {
      return true;
    }

    try {
      const { error } = await supabase
        .from('lesson_completions')
        .insert({
          user_email: userEmail,
          lesson_id: lessonId,
        });

      if (error) {
        // If it's a duplicate error, it's already completed
        if (error.code === '23505') {
          return true;
        }
        console.error('Error marking lesson complete:', error);
        return false;
      }

      // Update local state
      setCompletedLessonIds(prev => [...prev, lessonId]);
      return true;
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      return false;
    }
  }, [user?.email, completedLessonIds]);

  const getCompletedCount = useCallback(() => {
    return completedLessonIds.length;
  }, [completedLessonIds]);

  return {
    completedLessonIds,
    isLoading,
    isLessonCompleted,
    markLessonComplete,
    getCompletedCount,
    refetch: fetchCompletions,
  };
}
