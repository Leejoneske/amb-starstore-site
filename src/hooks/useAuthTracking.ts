// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { Ambassador } from '@/types';

export interface UserAuthStatus {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_activated: boolean;
  days_since_approval: number;
  password_changed: boolean;
}

interface AuthUser {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  created_at: string;
  password_changed?: boolean;
}

export const useAuthTracking = (isAdmin: boolean = false) => {
  return useQuery({
    queryKey: ['auth-tracking', isAdmin],
    queryFn: async (): Promise<UserAuthStatus[]> => {
      if (!isAdmin) return [];

      // Get all ambassador profiles with their user data
      const { data: ambassadors, error: ambassadorError } = await supabase
        .from('ambassador_profiles')
        .select(`
          *,
          profiles!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (ambassadorError) throw ambassadorError;

      // Get auth users data using admin function
      const { data: authUsers, error: authError } = await supabase.rpc('get_auth_users_info' as any);
      
      if (authError) {
        logger.warn('Could not fetch auth user data', { error: authError.message });
        // Fallback to basic data without auth info
        return ambassadors?.map((ambassador: any) => ({
          id: ambassador.user_id,
          email: ambassador.profiles?.email || 'Unknown',
          full_name: ambassador.profiles?.full_name || 'Unknown',
          created_at: ambassador.created_at,
          last_sign_in_at: null,
          email_confirmed_at: null,
          is_activated: false,
          days_since_approval: Math.floor(
            (new Date().getTime() - new Date(ambassador.approved_at || ambassador.created_at).getTime()) / 
            (1000 * 60 * 60 * 24)
          ),
          password_changed: false
        })) || [];
      }

      // Merge ambassador data with auth data
      const userStatuses: UserAuthStatus[] = ambassadors?.map((ambassador: any) => {
        const authUser = (authUsers as any)?.find((user: any) => user.id === ambassador.user_id);
        const approvalDate = new Date(ambassador.approved_at || ambassador.created_at);
        const daysSinceApproval = Math.floor(
          (new Date().getTime() - approvalDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: ambassador.user_id,
          email: ambassador.profiles.email,
          full_name: ambassador.profiles.full_name || 'Unknown',
          created_at: ambassador.created_at,
          last_sign_in_at: authUser?.last_sign_in_at || null,
          email_confirmed_at: authUser?.email_confirmed_at || null,
          is_activated: !!(authUser?.last_sign_in_at),
          days_since_approval: daysSinceApproval,
          password_changed: authUser?.password_changed || false
        };
      }) || [];

      return userStatuses;
    },
    enabled: isAdmin,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
};

export const useUserActivationStats = (isAdmin: boolean = false) => {
  return useQuery({
    queryKey: ['user-activation-stats', isAdmin],
    queryFn: async () => {
      if (!isAdmin) return null;

      const { data: ambassadors } = await supabase
        .from('ambassador_profiles')
        .select(`
          *,
          profiles!inner(*)
        `);

      if (!ambassadors) return null;

      // Get auth data
      const { data: authUsers } = await supabase.rpc('get_auth_users_info' as any);

      const stats = {
        total: ambassadors.length,
        activated: 0,
        pending: 0,
        recent_approvals: 0, // Last 7 days
        never_logged_in: 0,
        password_not_changed: 0
      };

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      ambassadors.forEach(ambassador => {
        const authUser = (authUsers as any)?.find((user: any) => user.id === ambassador.user_id);
        const approvalDate = new Date(ambassador.approved_at || ambassador.created_at);
        
        if (approvalDate >= sevenDaysAgo) {
          stats.recent_approvals++;
        }

        if (authUser?.last_sign_in_at) {
          stats.activated++;
        } else {
          stats.pending++;
          stats.never_logged_in++;
        }

        if (!authUser?.password_changed) {
          stats.password_not_changed++;
        }
      });

      return stats;
    },
    enabled: isAdmin,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};
