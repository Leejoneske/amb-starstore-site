import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';

export const useFirstLoginTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const trackFirstLogin = async () => {
      try {
        // Check if this is the first login by checking ambassador profile
        const { data: ambassadorProfile, error: profileError } = await supabase
          .from('ambassador_profiles')
          .select('first_login_at, password_change_required')
          .eq('user_id', user.id)
          .single();

        if (profileError || !ambassadorProfile) return;

        // If first_login_at is null, this is the first login
        if (!ambassadorProfile.first_login_at) {
          // Update the first login timestamp
          const { error: updateError } = await supabase.rpc('update_first_login', {
            user_uuid: user.id
          });

          if (updateError) {
            logger.error('Error updating first login status', { userId: user.id }, updateError);
            return;
          }

          // Show welcome message for first login
          toast({
            title: "Welcome to StarStore! 🎉",
            description: "Your account has been activated successfully. Consider changing your password for security.",
            duration: 10000,
          });
        }

        // Show password change reminder if still using temporary password
        if (ambassadorProfile.password_change_required) {
          setTimeout(() => {
            toast({
              title: "Security Reminder 🔐",
              description: "For your security, please change your temporary password in your account settings.",
              duration: 8000,
            });
          }, 3000);
        }
      } catch (error) {
        logger.error('Error in first login tracking', { userId: user?.id }, error as Error);
      }
    };

    // Run after a short delay to ensure user is fully loaded
    const timer = setTimeout(trackFirstLogin, 1000);
    return () => clearTimeout(timer);
  }, [user, toast]);
};

export const usePasswordChangeTracker = () => {
  const { user } = useAuth();

  const markPasswordChanged = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ambassador_profiles')
        .update({ 
          password_change_required: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error updating password change status', { userId: user?.id }, error as Error);
      }
    } catch (error) {
      logger.error('Error in password change tracking', { userId: user?.id }, error as Error);
    }
  };

  return { markPasswordChanged };
};