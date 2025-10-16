import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface RealTimeNotification {
  id: string;
  type: 'transaction' | 'referral' | 'payout' | 'tier_upgrade' | 'application';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export const useRealTimeUpdates = (userId: string | undefined, isAdmin: boolean = false) => {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time changes
    const channels: any[] = [];

    // Subscribe to transactions
    const transactionChannel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          ...(isAdmin ? {} : { filter: `ambassador_id=eq.${userId}` })
        },
        (payload) => {
          console.log('Transaction update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification: RealTimeNotification = {
              id: `transaction-${payload.new.id}`,
              type: 'transaction',
              title: 'New Transaction!',
              message: `You earned $${payload.new.commission_amount} from a new transaction`,
              timestamp: new Date(),
              read: false,
              data: payload.new
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
            
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .subscribe();

    channels.push(transactionChannel);

    // Subscribe to referrals
    const referralChannel = supabase
      .channel('referrals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          ...(isAdmin ? {} : { filter: `ambassador_id=eq.${userId}` })
        },
        (payload) => {
          console.log('Referral update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification: RealTimeNotification = {
              id: `referral-${payload.new.id}`,
              type: 'referral',
              title: 'New Referral!',
              message: `Someone signed up using your referral code`,
              timestamp: new Date(),
              read: false,
              data: payload.new
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
            
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .subscribe();

    channels.push(referralChannel);

    // Subscribe to payouts
    const payoutChannel = supabase
      .channel('payouts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payouts',
          ...(isAdmin ? {} : { filter: `ambassador_id=eq.${userId}` })
        },
        (payload) => {
          console.log('Payout update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newNotification: RealTimeNotification = {
              id: `payout-${payload.new.id}`,
              type: 'payout',
              title: payload.eventType === 'INSERT' ? 'Payout Initiated!' : 'Payout Updated!',
              message: `Your payout of $${payload.new.total_amount} is ${payload.new.status}`,
              timestamp: new Date(),
              read: false,
              data: payload.new
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
            
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ['payouts'] });
        }
      )
      .subscribe();

    channels.push(payoutChannel);

    // Admin-only subscriptions
    if (isAdmin) {
      // Subscribe to applications
      const applicationChannel = supabase
        .channel('applications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'applications'
          },
          (payload) => {
            console.log('Application update:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newNotification: RealTimeNotification = {
                id: `application-${payload.new.id}`,
                type: 'application',
                title: 'New Application!',
                message: `${payload.new.full_name} submitted an ambassador application`,
                timestamp: new Date(),
                read: false,
                data: payload.new
              };
              
              setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
              
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
            
            queryClient.invalidateQueries({ queryKey: ['applications'] });
          }
        )
        .subscribe();

      channels.push(applicationChannel);

      // Subscribe to ambassador profile changes (tier upgrades)
      const ambassadorChannel = supabase
        .channel('ambassador_profiles')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ambassador_profiles'
          },
          (payload) => {
            console.log('Ambassador profile update:', payload);
            
            // Check if tier was upgraded
            if (payload.old.current_tier !== payload.new.current_tier) {
              const newNotification: RealTimeNotification = {
                id: `tier-${payload.new.id}`,
                type: 'tier_upgrade',
                title: 'Tier Upgrade!',
                message: `Ambassador upgraded from ${payload.old.current_tier} to ${payload.new.current_tier}`,
                timestamp: new Date(),
                read: false,
                data: payload.new
              };
              
              setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
              
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
            
            queryClient.invalidateQueries({ queryKey: ['all-ambassadors'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
          }
        )
        .subscribe();

      channels.push(ambassadorChannel);
    }

    // Set connection status
    setIsConnected(true);

    // Cleanup
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, [userId, isAdmin, queryClient, toast]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};