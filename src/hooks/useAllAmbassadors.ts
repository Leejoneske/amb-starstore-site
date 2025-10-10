import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAllAmbassadors = () => {
  const { data: ambassadors, isLoading } = useQuery({
    queryKey: ['all-ambassadors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ambassador_profiles')
        .select(`
          *,
          profiles!ambassador_profiles_user_id_fkey(full_name, email, created_at)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return {
    ambassadors,
    isLoading,
  };
};