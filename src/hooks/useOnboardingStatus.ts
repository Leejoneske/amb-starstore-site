import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingStatus {
  isCompleted: boolean;
  hasProfile: boolean;
  hasTelegramId: boolean;
  hasReferralCode: boolean;
  needsOnboarding: boolean;
}

export const useOnboardingStatus = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['onboarding-status', userId],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!userId) {
        return {
          isCompleted: false,
          hasProfile: false,
          hasTelegramId: false,
          hasReferralCode: false,
          needsOnboarding: true,
        };
      }

      const { data: profile, error } = await supabase
        .from('ambassador_profiles')
        .select('telegram_id, referral_code')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no profile exists, user needs onboarding
        return {
          isCompleted: false,
          hasProfile: false,
          hasTelegramId: false,
          hasReferralCode: false,
          needsOnboarding: true,
        };
      }

      const hasTelegramId = !!profile?.telegram_id;
      const hasReferralCode = !!profile?.referral_code;
      const isCompleted = hasTelegramId && hasReferralCode;

      return {
        isCompleted,
        hasProfile: true,
        hasTelegramId,
        hasReferralCode,
        needsOnboarding: !isCompleted,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};