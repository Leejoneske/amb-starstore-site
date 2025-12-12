import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { useAuth } from '@/contexts/AuthContext';
import { getTierConfig, getNextTier, calculateTierProgress, getAllTiers, TierConfig } from '@/lib/tier-utils';
import { Star, Rocket, Zap, Crown, TrendingUp, Users, Share2, Check, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierLevelsDisplayProps {
  ambassadorId?: string;
}

const tierIcons = {
  entry: Star,
  growing: Rocket,
  advanced: Zap,
  elite: Crown
};

const tierColors = {
  entry: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-500',
    gradient: 'from-violet-500 to-purple-600'
  },
  growing: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500'
  },
  advanced: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500'
  },
  elite: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
    gradient: 'from-amber-500 to-orange-500'
  }
};

export const TierLevelsDisplay = ({ ambassadorId }: TierLevelsDisplayProps) => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useAmbassadorProfile(user?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader className="pb-4">
            <div className="h-6 bg-muted rounded w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Unable to load tier information</p>
        </CardContent>
      </Card>
    );
  }

  const currentTier = getTierConfig(profile.current_tier);
  const nextTier = getNextTier(profile.current_tier);
  const progress = calculateTierProgress(profile);
  const allTiers = getAllTiers();
  const currentTierIndex = allTiers.findIndex(t => t.tier === currentTier.tier);

  const CurrentIcon = tierIcons[currentTier.tier as keyof typeof tierIcons] || Star;
  const currentColors = tierColors[currentTier.tier as keyof typeof tierColors] || tierColors.entry;

  return (
    <div className="space-y-6">
      {/* Current Tier Card */}
      <Card className={cn('relative overflow-hidden border-2', currentColors.border)}>
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5', currentColors.gradient)} />
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl', currentColors.bg)}>
                <CurrentIcon className={cn('h-6 w-6', currentColors.text)} />
              </div>
              <div>
                <span className="text-lg">Your Current Level</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Level {currentTier.level} of {allTiers.length}
                </p>
              </div>
            </CardTitle>
            <Badge 
              variant="secondary" 
              className={cn(
                'text-sm font-semibold px-4 py-1.5 bg-gradient-to-r text-white border-0',
                currentColors.gradient
              )}
            >
              {currentTier.displayName}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="relative pt-4 space-y-6">
          {/* Benefits Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <div className={cn('text-2xl font-bold', currentColors.text)}>
                {currentTier.benefits.commissionRate}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Commission Rate</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-foreground">
                ${currentTier.benefits.baseEarnings}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Base Earnings</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-foreground">
                ${currentTier.benefits.qualityBonus}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Quality Bonus</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier ? (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Progress to {nextTier.displayName}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress.overallProgress)}% complete
                </span>
              </div>
              
              <Progress value={progress.overallProgress} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  progress.referralsComplete 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-muted/50 border-transparent'
                )}>
                  <Users className={cn(
                    'h-4 w-4',
                    progress.referralsComplete ? 'text-green-500' : 'text-muted-foreground'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">Referrals</div>
                    <div className="text-xs text-muted-foreground">
                      {profile.total_referrals} / {nextTier.requirements.referrals}
                    </div>
                  </div>
                  {progress.referralsComplete && (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  progress.socialPostsComplete 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-muted/50 border-transparent'
                )}>
                  <Share2 className={cn(
                    'h-4 w-4',
                    progress.socialPostsComplete ? 'text-green-500' : 'text-muted-foreground'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">Social Posts</div>
                    <div className="text-xs text-muted-foreground">
                      {profile.social_posts_this_month} / {nextTier.requirements.socialPosts}
                    </div>
                  </div>
                  {progress.socialPostsComplete && (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <Crown className="h-6 w-6 text-amber-500" />
                <div>
                  <div className="font-semibold text-amber-600 dark:text-amber-400">
                    Maximum Level Achieved!
                  </div>
                  <div className="text-sm text-muted-foreground">
                    You've reached the highest ambassador tier
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Tiers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            All Ambassador Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {allTiers.map((tier, index) => {
              const Icon = tierIcons[tier.tier as keyof typeof tierIcons] || Star;
              const colors = tierColors[tier.tier as keyof typeof tierColors] || tierColors.entry;
              const isCurrentTier = tier.tier === currentTier.tier;
              const isUnlocked = index <= currentTierIndex;
              const isNextTier = index === currentTierIndex + 1;

              return (
                <div
                  key={tier.tier}
                  className={cn(
                    'relative rounded-xl border-2 p-4 transition-all duration-200',
                    isCurrentTier && cn(colors.border, colors.bg),
                    isUnlocked && !isCurrentTier && 'border-border bg-muted/30',
                    !isUnlocked && 'border-dashed border-muted-foreground/20 opacity-60'
                  )}
                >
                  {isCurrentTier && (
                    <Badge 
                      className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs"
                    >
                      Current
                    </Badge>
                  )}
                  {isNextTier && (
                    <Badge 
                      variant="outline"
                      className="absolute -top-2 -right-2 text-xs border-primary text-primary"
                    >
                      Next
                    </Badge>
                  )}

                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={cn(
                      'p-3 rounded-xl',
                      isUnlocked ? colors.bg : 'bg-muted'
                    )}>
                      {isUnlocked ? (
                        <Icon className={cn('h-6 w-6', colors.text)} />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div>
                      <div className="font-semibold">{tier.displayName}</div>
                      <div className="text-xs text-muted-foreground">Level {tier.level}</div>
                    </div>

                    <div className="w-full space-y-2 text-xs">
                      <div className="pt-2 border-t border-border">
                        <div className="text-muted-foreground mb-1">Requirements</div>
                        {tier.requirements.referrals === 0 ? (
                          <div className="text-green-600 font-medium">Starting Tier</div>
                        ) : (
                          <div className="space-y-0.5 text-muted-foreground">
                            <div>{tier.requirements.referrals}+ referrals</div>
                            <div>{tier.requirements.socialPosts}+ social posts</div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border">
                        <div className="text-muted-foreground mb-1">Benefits</div>
                        <div className={cn('text-lg font-bold', isUnlocked ? colors.text : 'text-muted-foreground')}>
                          {tier.benefits.commissionRate}%
                        </div>
                        <div className="text-muted-foreground">commission</div>
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
