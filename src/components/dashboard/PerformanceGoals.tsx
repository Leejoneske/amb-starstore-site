// @ts-nocheck
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Trophy, 
  Star, 
  TrendingUp, 
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getTierInfo, getNextTier } from '@/lib/tier-utils';

interface PerformanceGoalsProps {
  ambassadorProfile: {
    current_tier: string;
    total_referrals: number;
    total_earnings: number;
    social_posts_this_month: number;
    quality_transaction_rate?: number;
    avg_stars_per_transaction?: number;
    lifetime_stars: number;
  };
}

export const PerformanceGoals = ({ ambassadorProfile }: PerformanceGoalsProps) => {
  const currentTierInfo = getTierInfo(ambassadorProfile.current_tier);
  const nextTierInfo = getNextTier(ambassadorProfile.current_tier);

  const goals = [
    {
      id: 'referrals',
      title: 'Referral Target',
      icon: Target,
      current: ambassadorProfile.total_referrals,
      target: nextTierInfo?.requirements.referrals || currentTierInfo.requirements.referrals,
      unit: 'referrals',
      color: 'text-blue-600 bg-blue-50',
      description: nextTierInfo ? `Reach ${nextTierInfo.displayName} tier` : 'Maintain current tier'
    },
    {
      id: 'social_posts',
      title: 'Social Posts',
      icon: Calendar,
      current: ambassadorProfile.social_posts_this_month,
      target: currentTierInfo.requirements.socialPosts,
      unit: 'posts',
      color: 'text-green-600 bg-green-50',
      description: 'Monthly requirement'
    },
    {
      id: 'quality_rate',
      title: 'Quality Rate',
      icon: Star,
      current: ambassadorProfile.quality_transaction_rate || 0,
      target: 70,
      unit: '%',
      color: 'text-yellow-600 bg-yellow-50',
      description: 'Maintain high-quality transactions'
    },
    {
      id: 'avg_stars',
      title: 'Average Stars',
      icon: Award,
      current: ambassadorProfile.avg_stars_per_transaction || 0,
      target: currentTierInfo.requirements.avgStars,
      unit: 'stars',
      color: 'text-purple-600 bg-purple-50',
      description: 'Per transaction average'
    }
  ];

  const completedGoals = goals.filter(goal => goal.current >= goal.target).length;
  const overallProgress = (completedGoals / goals.length) * 100;

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (current: number, target: number) => {
    if (current >= target) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Performance Goals</h3>
          </div>
          <Badge variant={overallProgress === 100 ? 'default' : 'secondary'}>
            {completedGoals}/{goals.length} Complete
          </Badge>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{overallProgress.toFixed(0)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <div className="text-sm text-muted-foreground">
          {overallProgress === 100 ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              All goals completed! Excellent performance.
            </div>
          ) : (
            `Complete ${goals.length - completedGoals} more goals to achieve 100% performance.`
          )}
        </div>
      </Card>

      {/* Individual Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progress = Math.min(100, (goal.current / goal.target) * 100);
          const isCompleted = goal.current >= goal.target;
          
          return (
            <Card key={goal.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${goal.color}`}>
                    <goal.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{goal.title}</h4>
                    <p className="text-xs text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
                {getStatusIcon(goal.current, goal.target)}
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-bold">
                    {goal.unit === '%' ? goal.current.toFixed(1) : goal.current}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{goal.target} {goal.unit}
                    </span>
                  </span>
                  <Badge variant={isCompleted ? 'default' : 'secondary'} className="text-xs">
                    {progress.toFixed(0)}%
                  </Badge>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2"
                />
              </div>

              {!isCompleted && (
                <div className="text-xs text-muted-foreground">
                  {goal.unit === '%' 
                    ? `${(goal.target - goal.current).toFixed(1)}% more needed`
                    : `${goal.target - goal.current} more ${goal.unit} needed`
                  }
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Tier Progress */}
      {nextTierInfo && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Next Tier: {nextTierInfo.displayName}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Referrals Progress</span>
                <span className="text-sm text-muted-foreground">
                  {ambassadorProfile.total_referrals} / {nextTierInfo.requirements.referrals}
                </span>
              </div>
              <Progress 
                value={(ambassadorProfile.total_referrals / nextTierInfo.requirements.referrals) * 100} 
                className="h-2" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Next Tier Benefits</div>
                <div className="text-lg font-semibold text-primary">
                  ${nextTierInfo.benefits.minEarnings}+ commission
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">NFT Level</div>
                <div className="text-lg font-semibold">
                  Level {nextTierInfo.benefits.nftLevel}
                </div>
              </div>
            </div>

            {nextTierInfo.benefits.extras && Array.isArray(nextTierInfo.benefits.extras) && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">Additional Benefits:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {nextTierInfo.benefits.extras.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};