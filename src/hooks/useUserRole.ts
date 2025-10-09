import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // No role found is not an error - user just doesn't have a role yet
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data?.role || null;
    },
    enabled: !!userId,
  });
};
