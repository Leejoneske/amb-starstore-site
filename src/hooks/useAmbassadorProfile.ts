import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAmbassadorProfile = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: ambassadorProfile, isLoading } = useQuery({
    queryKey: ['ambassador-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('ambassador_profiles')
        .select('*')
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

  return {
    ambassadorProfile,
    tierConfig,
    isLoading,
    updateSocialPosts,
  };
};