import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useApplications = () => {
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({ 
      applicationId, 
      status, 
      rejectionReason 
    }: { 
      applicationId: string; 
      status: 'approved' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      const { data, error } = await supabase
        .from('applications')
        .update({ 
          status,
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const createAmbassadorProfile = useMutation({
    mutationFn: async ({ 
      userId, 
      referralCode 
    }: { 
      userId: string; 
      referralCode: string;
    }) => {
      const { data, error } = await supabase
        .from('ambassador_profiles')
        .insert({
          user_id: userId,
          referral_code: referralCode,
          status: 'active',
          approved_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambassador-profiles'] });
    },
  });

  return {
    applications,
    isLoading,
    updateApplicationStatus,
    createAmbassadorProfile,
  };
};