import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export function useStreak() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStreak = useCallback(async () => {
    try {
      const userEmail = user?.email;
      
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      // Fetch all completions with dates
      const { data, error } = await supabase
        .from('lesson_completions')
        .select('completed_at')
        .eq('user_email', userEmail)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching completions for streak:', error);
        setIsLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setStreakData({ currentStreak: 0, longestStreak: 0, lastActivityDate: null });
        setIsLoading(false);
        return;
      }

      // Get unique dates (in local timezone)
      const uniqueDates = [...new Set(
        data.map((c: { completed_at: string }) => {
          const date = new Date(c.completed_at);
          return date.toISOString().split('T')[0];
        })
      )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      if (uniqueDates.length === 0) {
        setStreakData({ currentStreak: 0, longestStreak: 0, lastActivityDate: null });
        setIsLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      // Check if streak is still active (today or yesterday has activity)
      const streakActive = uniqueDates[0] === today || uniqueDates[0] === yesterday;
      
      if (streakActive) {
        // Calculate current streak
        let checkDate = new Date(uniqueDates[0]);
        
        for (let i = 0; i < uniqueDates.length; i++) {
          const expectedDate = new Date(checkDate);
          expectedDate.setDate(checkDate.getDate() - i);
          const expectedDateStr = expectedDate.toISOString().split('T')[0];
          
          if (uniqueDates.includes(expectedDateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      for (let i = 0; i < uniqueDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(uniqueDates[i - 1]);
          const currDate = new Date(uniqueDates[i]);
          const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      setStreakData({
        currentStreak,
        longestStreak,
        lastActivityDate: uniqueDates[0],
      });
      setIsLoading(false);
    } catch (err) {
      console.error('Error calculating streak:', err);
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    calculateStreak();
  }, [calculateStreak]);

  return {
    ...streakData,
    isLoading,
    refetch: calculateStreak,
  };
}
