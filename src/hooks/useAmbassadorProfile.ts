import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateReferralCode } from '@/config/telegram';
import { useToast } from '@/hooks/use-toast';

export const useAmbassadorProfile = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ambassadorProfile, isLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['ambassador-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('ambassador_profiles')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: tierConfig } = useQuery({
    queryKey: ['tier-config', ambassadorProfile?.current_tier],
    queryFn: async () => {
      if (!ambassadorProfile?.current_tier) return null;
      
      const { data, error } = await supabase
        .from('tier_configs')
        .select('*')
        .eq('tier', ambassadorProfile.current_tier)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!ambassadorProfile?.current_tier,
  });

  const updateSocialPosts = useMutation({
    mutationFn: async (postData: {
      platform: string;
      post_url: string;
      post_content?: string;
    }) => {
      if (!ambassadorProfile?.id) throw new Error('No ambassador profile');
      
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          ambassador_id: ambassadorProfile.id,
          ...postData,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
    },
  });

  const generateReferralCodeMutation = useMutation({
    mutationFn: async () => {
      if (!ambassadorProfile?.id) throw new Error('No ambassador profile');
      
      const newReferralCode = generateReferralCode();
      
      const { data, error } = await supabase
        .from('ambassador_profiles')
        .update({
          referral_code: newReferralCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', ambassadorProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Referral Code Generated! 🚀",
        description: "Your unique referral code is ready to use.",
      });
      queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate referral code",
        variant: "destructive",
      });
    }
  });

  return {
    ambassadorProfile,
    tierConfig,
    isLoading,
    updateSocialPosts,
    generateReferralCode: generateReferralCodeMutation.mutate,
    isGeneratingReferralCode: generateReferralCodeMutation.isPending,
    refetch: refetchProfile,
    data: ambassadorProfile, // Alias for compatibility
  };
};