import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { useAuth } from '@/contexts/AuthContext';
import { getTierConfig, getNextTier, calculateTierProgress } from '@/lib/tier-utils';
import { Star, Trophy, Target, Zap, Crown, Sparkles } from 'lucide-react';
type TierLevel = 'explorer' | 'pioneer' | 'trailblazer' | 'legend';

interface TierLevelsDisplayProps {
  ambassadorId?: string;
}

export const TierLevelsDisplay = ({ ambassadorId }: TierLevelsDisplayProps) => {
const { user } = useAuth();
  const { data: profile } = useAmbassadorProfile(user?.id);

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Ambassador Levels
          </CardTitle>
          <CardDescription>Loading tier information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentTier = getTierConfig(profile.current_tier as TierLevel);
  const nextTier = getNextTier(profile.current_tier as TierLevel);
  const progress = calculateTierProgress(profile);

  const allTiers: TierLevel[] = ['explorer', 'pioneer', 'trailblazer', 'legend'];

  const getTierIcon = (tier: TierLevel) => {
    const icons = {
      explorer: Star,
      pioneer: Target,
      trailblazer: Zap,
      legend: Crown
    };
    return icons[tier];
  };

  const getTierColor = (tier: TierLevel) => {
    const colors = {
      explorer: 'text-blue-500',
      pioneer: 'text-green-500',
      trailblazer: 'text-purple-500',
      legend: 'text-yellow-500'
    };
    return colors[tier];
  };

  const getTierBgColor = (tier: TierLevel) => {
    const colors = {
      explorer: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
      pioneer: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
      trailblazer: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
      legend: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
    };
    return colors[tier];
  };

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card className={`border-2 ${getTierBgColor(profile.current_tier as TierLevel)}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Current Level
            </div>
            <Badge variant="default" className="text-sm">
              {currentTier.displayName}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Tier Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getTierIcon(profile.current_tier as TierLevel);
                  return <Icon className={`h-8 w-8 ${getTierColor(profile.current_tier as TierLevel)}`} />;
                })()}
                <div>
                  <h3 className="text-xl font-semibold">{currentTier.displayName}</h3>
                  <p className="text-sm text-muted-foreground">Your current ambassador level</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Commission Rate</p>
                  <p className="font-semibold text-green-600">{currentTier.benefits.commissionRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Min Earnings</p>
                  <p className="font-semibold">${currentTier.benefits.minEarnings}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Free Stars</p>
                  <p className="font-semibold text-blue-600">{currentTier.benefits.freeStars}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">NFT Level</p>
                  <p className="font-semibold text-purple-600">{currentTier.benefits.nftLevel}</p>
                </div>
              </div>
            </div>

            {/* Progress to Next Tier */}
            {nextTier && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Progress to {nextTier.displayName}</h4>
                  <Progress value={progress.overallProgress} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {progress.overallProgress.toFixed(1)}% complete
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Referrals</span>
                    <span className={progress.referralsComplete ? 'text-green-600' : 'text-muted-foreground'}>
                      {profile.total_referrals}/{nextTier.requirements.referrals}
                      {progress.referralsComplete && ' ✓'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Posts</span>
                    <span className={progress.socialPostsComplete ? 'text-green-600' : 'text-muted-foreground'}>
                      {profile.social_posts_this_month}/{nextTier.requirements.socialPosts}
                      {progress.socialPostsComplete && ' ✓'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quality Rate</span>
                    <span className={progress.qualityRateComplete ? 'text-green-600' : 'text-muted-foreground'}>
                      {((profile.quality_transaction_rate || 0) * 100).toFixed(1)}%/{(nextTier.requirements.qualityRate * 100).toFixed(0)}%
                      {progress.qualityRateComplete && ' ✓'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Tiers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            All Ambassador Levels
          </CardTitle>
          <CardDescription>
            Complete requirements to unlock higher tiers and better rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allTiers.map((tierKey) => {
              const tier = getTierConfig(tierKey);
              const Icon = getTierIcon(tierKey);
              const isCurrentTier = (profile.current_tier as string) === tierKey;
              const isUnlocked = allTiers.indexOf((profile.current_tier === 'entry' || profile.current_tier === 'growing' || profile.current_tier === 'advanced' || profile.current_tier === 'elite' ? profile.current_tier : 'explorer') as TierLevel) >= allTiers.indexOf(tierKey);

              return (
                <div
                  key={tierKey}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCurrentTier 
                      ? `${getTierBgColor(tierKey)} shadow-lg` 
                      : isUnlocked
                      ? 'bg-muted/50 border-muted-foreground/20'
                      : 'bg-muted/20 border-muted-foreground/10 opacity-60'
                  }`}
                >
                  <div className="text-center space-y-3">
                    <Icon className={`h-8 w-8 mx-auto ${
                      isCurrentTier ? getTierColor(tierKey) : 
                      isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/50'
                    }`} />
                    
                    <div>
                      <h3 className="font-semibold">{tier.displayName}</h3>
                      {isCurrentTier && (
                        <Badge variant="default" className="text-xs mt-1">
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">Requirements:</p>
                        <p>{tier.requirements.referrals} referrals</p>
                        <p>{tier.requirements.socialPosts} social posts</p>
                        <p>{(tier.requirements.qualityRate * 100).toFixed(0)}% quality rate</p>
                      </div>
                      
                      <div className="space-y-1 pt-2 border-t border-muted-foreground/20">
                        <p className="font-medium text-muted-foreground">Benefits:</p>
                        <p className="text-green-600">{tier.benefits.commissionRate}% commission</p>
                        <p>${tier.benefits.minEarnings} min earnings</p>
                        <p className="text-blue-600">{tier.benefits.freeStars} free stars</p>
                        <p className="text-purple-600">Level {tier.benefits.nftLevel} NFT</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};