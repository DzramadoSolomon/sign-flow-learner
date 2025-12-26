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

      // Use edge function for secure access to completion data
      const { data: response, error } = await supabase.functions.invoke('get-completions', {
        body: { userEmail: userEmail.toLowerCase() }
      });

      if (error) {
        console.error('Error fetching completions:', error);
        setIsLoading(false);
        return;
      }

      const completionData = response?.data || [];
      const lessonIds = completionData.map((c: { lesson_id: string }) => c.lesson_id);
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
      // Use edge function for secure completion marking
      const { data: response, error } = await supabase.functions.invoke('get-completions', {
        body: {
          userEmail: userEmail.toLowerCase(),
          action: 'mark_complete',
          lessonId,
          userId: user?.id || null,
        }
      });

      if (error) {
        console.error('Error marking lesson complete:', error);
        return false;
      }

      if (response?.error) {
        console.error('Error marking lesson complete:', response.error);
        return false;
      }

      // Update local state
      setCompletedLessonIds(prev => [...prev, lessonId]);
      return true;
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      return false;
    }
  }, [user?.email, user?.id, completedLessonIds]);

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
