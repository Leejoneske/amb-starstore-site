import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePayouts = (ambassadorId: string | undefined) => {
  return useQuery({
    queryKey: ['payouts', ambassadorId],
    queryFn: async () => {
      if (!ambassadorId) return [];
      
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('ambassador_id', ambassadorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!ambassadorId,
  });
};