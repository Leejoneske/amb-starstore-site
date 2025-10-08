import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTransactions = (ambassadorId: string | undefined) => {
  return useQuery({
    queryKey: ['transactions', ambassadorId],
    queryFn: async () => {
      if (!ambassadorId) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('ambassador_id', ambassadorId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!ambassadorId,
  });
};