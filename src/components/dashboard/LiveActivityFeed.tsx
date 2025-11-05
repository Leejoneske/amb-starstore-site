import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Pause, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface ActivityItem {
  id: string;
  type: 'transaction' | 'referral' | 'application' | 'payout' | 'tier_upgrade';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface LiveActivityFeedProps {
  isAdmin?: boolean;
  limit?: number;
}

export const LiveActivityFeed = ({ isAdmin = false, limit = 20 }: LiveActivityFeedProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecentActivity = async () => {
    setIsLoading(true);
    try {
      const promises = [];

      // Fetch recent transactions
      promises.push(
        supabase
          .from('transactions')
          .select(`
            *,
            ambassador_profiles!inner(
              profiles!inner(full_name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit / 4)
      );

      // Fetch recent referrals
      promises.push(
        supabase
          .from('referrals')
          .select(`
            *,
            ambassador_profiles!inner(
              profiles!inner(full_name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit / 4)
      );

      if (isAdmin) {
        // Fetch recent applications
        promises.push(
          supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit / 4)
        );

        // Fetch recent payouts
        promises.push(
          supabase
            .from('payouts')
            .select(`
              *,
              ambassador_profiles!inner(
                profiles!inner(full_name)
              )
            `)
            .order('created_at', { ascending: false })
            .limit(limit / 4)
        );
      }

      const results = await Promise.all(promises);
      const [transactionsResult, referralsResult, applicationsResult, payoutsResult] = results;

      const newActivities: ActivityItem[] = [];

      // Process transactions (with null safety)
      if (transactionsResult.data && Array.isArray(transactionsResult.data)) {
        transactionsResult.data.forEach(transaction => {
          newActivities.push({
            id: `transaction-${transaction.id}`,
            type: 'transaction',
            title: 'New Transaction',
            description: `${transaction.ambassador_profiles?.profiles?.full_name || 'Ambassador'} earned $${transaction.commission_amount} commission`,
            timestamp: new Date(transaction.created_at),
            metadata: transaction
          });
        });
      }

      // Process referrals (with null safety)
      if (referralsResult.data && Array.isArray(referralsResult.data)) {
        referralsResult.data.forEach(referral => {
          newActivities.push({
            id: `referral-${referral.id}`,
            type: 'referral',
            title: 'New Referral',
            description: `${referral.ambassador_profiles?.profiles?.full_name || 'Ambassador'} got a new referral`,
            timestamp: new Date(referral.created_at),
            metadata: referral
          });
        });
      }

      // Process applications (admin only - with null safety)
      if (isAdmin && applicationsResult?.data && Array.isArray(applicationsResult.data)) {
        applicationsResult.data.forEach(application => {
          newActivities.push({
            id: `application-${application.id}`,
            type: 'application',
            title: 'New Application',
            description: `${application.full_name} submitted an ambassador application`,
            timestamp: new Date(application.created_at),
            metadata: application
          });
        });
      }

      // Process payouts (admin only - with null safety)
      if (isAdmin && payoutsResult?.data && Array.isArray(payoutsResult.data)) {
        payoutsResult.data.forEach(payout => {
          newActivities.push({
            id: `payout-${payout.id}`,
            type: 'payout',
            title: 'Payout Processed',
            description: `$${payout.total_amount} payout to ${payout.ambassador_profiles?.profiles?.full_name || 'Ambassador'}`,
            timestamp: new Date(payout.created_at),
            metadata: payout
          });
        });
      }

      // Sort by timestamp and limit
      newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(newActivities.slice(0, limit));
    } catch (error) {
      logger.error('Error fetching activity feed', { isAdmin, limit }, error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, [isAdmin, limit]);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchRecentActivity();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isLive, isAdmin, limit]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'transaction': return '💰';
      case 'referral': return '👥';
      case 'application': return '📝';
      case 'payout': return '💳';
      case 'tier_upgrade': return '🚀';
      default: return '📊';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'transaction': return 'text-green-600 bg-green-50';
      case 'referral': return 'text-blue-600 bg-blue-50';
      case 'application': return 'text-purple-600 bg-purple-50';
      case 'payout': return 'text-orange-600 bg-orange-50';
      case 'tier_upgrade': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Live Activity Feed</h3>
          {isLive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600">Live</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className="h-8 px-2"
          >
            {isLive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecentActivity}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-96">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here as it happens</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="text-lg">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getActivityColor(activity.type)}`}
                    >
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};