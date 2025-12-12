import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('useUserRole: No user id available');
        return null;
      }

      console.log('useUserRole: Fetching role for user:', user.id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      console.log('useUserRole: Got role data:', data);
      return data?.role || 'user';
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch to ensure fresh data
    gcTime: 0, // Don't cache (formerly cacheTime)
  });
};

export const useIsAdmin = () => {
  const { data: role, isLoading } = useUserRole();
  console.log('useIsAdmin: role =', role, 'isLoading =', isLoading, 'isAdmin =', role === 'admin');
  return {
    isAdmin: role === 'admin',
    isLoading,
  };
};
