export interface TierInfo {
  name: string;
  displayName: string;
  level: number;
  color: string;
  gradient: string;
  icon: string;
  requirements: {
    referrals: number;
    socialPosts: number;
    minTransactions: number;
  };
  benefits: {
    baseEarnings: number;
    qualityBonus: number;
    commissionRate: number;
  };
}

export interface TierConfig {
  tier: string;
  displayName: string;
  level: number;
  icon: string;
  requirements: {
    referrals: number;
    socialPosts: number;
    minTransactions: number;
  };
  benefits: {
    baseEarnings: number;
    qualityBonus: number;
    commissionRate: number;
  };
}

// Tier data based on actual database tier_configs table
// Entry = 30 referrals, 0 social posts, 0 min transactions, 6% commission
// Growing = 50 referrals, 4 social posts, 30 min transactions, 70% commission
// Advanced = 70 referrals, 6 social posts, 50 min transactions, 75% commission
// Elite = 100 referrals, 8 social posts, 70 min transactions, 30% commission

export const TIER_INFO: Record<string, TierInfo> = {
  entry: {
    name: 'entry',
    displayName: 'Entry Level',
    level: 1,
    color: '#A78BFA',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
    icon: '🌟',
    requirements: {
      referrals: 0,
      socialPosts: 0,
      minTransactions: 0
    },
    benefits: {
      baseEarnings: 13,
      qualityBonus: 30,
      commissionRate: 6
    }
  },
  growing: {
    name: 'growing',
    displayName: 'Growing Ambassador',
    level: 2,
    color: '#60A5FA',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
    icon: '🚀',
    requirements: {
      referrals: 30,
      socialPosts: 4,
      minTransactions: 30
    },
    benefits: {
      baseEarnings: 35,
      qualityBonus: 25,
      commissionRate: 70
    }
  },
  advanced: {
    name: 'advanced',
    displayName: 'Advanced Ambassador',
    level: 3,
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
    icon: '⚡',
    requirements: {
      referrals: 50,
      socialPosts: 6,
      minTransactions: 50
    },
    benefits: {
      baseEarnings: 52.5,
      qualityBonus: 28.5,
      commissionRate: 75
    }
  },
  elite: {
    name: 'elite',
    displayName: 'Elite Ambassador',
    level: 4,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    icon: '👑',
    requirements: {
      referrals: 70,
      socialPosts: 8,
      minTransactions: 70
    },
    benefits: {
      baseEarnings: 30,
      qualityBonus: 30,
      commissionRate: 30
    }
  }
};

export const TIER_CONFIGS: Record<string, TierConfig> = {
  entry: {
    tier: 'entry',
    displayName: 'Entry Level',
    level: 1,
    icon: '🌟',
    requirements: {
      referrals: 0,
      socialPosts: 0,
      minTransactions: 0
    },
    benefits: {
      baseEarnings: 13,
      qualityBonus: 30,
      commissionRate: 6
    }
  },
  growing: {
    tier: 'growing',
    displayName: 'Growing Ambassador',
    level: 2,
    icon: '🚀',
    requirements: {
      referrals: 30,
      socialPosts: 4,
      minTransactions: 30
    },
    benefits: {
      baseEarnings: 35,
      qualityBonus: 25,
      commissionRate: 70
    }
  },
  advanced: {
    tier: 'advanced',
    displayName: 'Advanced Ambassador',
    level: 3,
    icon: '⚡',
    requirements: {
      referrals: 50,
      socialPosts: 6,
      minTransactions: 50
    },
    benefits: {
      baseEarnings: 52.5,
      qualityBonus: 28.5,
      commissionRate: 75
    }
  },
  elite: {
    tier: 'elite',
    displayName: 'Elite Ambassador',
    level: 4,
    icon: '👑',
    requirements: {
      referrals: 70,
      socialPosts: 8,
      minTransactions: 70
    },
    benefits: {
      baseEarnings: 30,
      qualityBonus: 30,
      commissionRate: 30
    }
  }
};

// Map display names for backward compatibility
const tierDisplayMap: Record<string, string> = {
  'explorer': 'entry',
  'pioneer': 'growing',
  'trailblazer': 'advanced',
  'legend': 'elite'
};

export const getTierInfo = (tier: string): TierInfo => {
  const mappedTier = tierDisplayMap[tier.toLowerCase()] || tier.toLowerCase();
  return TIER_INFO[mappedTier] || TIER_INFO.entry;
};

export const getTierConfig = (tier: string): TierConfig => {
  const mappedTier = tierDisplayMap[tier.toLowerCase()] || tier.toLowerCase();
  return TIER_CONFIGS[mappedTier] || TIER_CONFIGS.entry;
};

export const getNextTier = (currentTier: string): TierConfig | null => {
  const mappedTier = tierDisplayMap[currentTier.toLowerCase()] || currentTier.toLowerCase();
  const tierOrder = ['entry', 'growing', 'advanced', 'elite'];
  const currentIndex = tierOrder.indexOf(mappedTier);
  const nextTierName = tierOrder[currentIndex + 1];
  return nextTierName ? TIER_CONFIGS[nextTierName] : null;
};

export const getTierBadgeClass = (tier: string): string => {
  const mappedTier = tierDisplayMap[tier.toLowerCase()] || tier.toLowerCase();
  return `level-${mappedTier}`;
};

export const getAllTiers = (): TierConfig[] => {
  return Object.values(TIER_CONFIGS).sort((a, b) => a.level - b.level);
};

export const calculateTierProgress = (profile: {
  total_referrals: number;
  social_posts_this_month: number;
  current_tier: string;
}): {
  overallProgress: number;
  referralsProgress: number;
  socialPostsProgress: number;
  referralsComplete: boolean;
  socialPostsComplete: boolean;
} => {
  const nextTier = getNextTier(profile.current_tier);
  
  if (!nextTier) {
    return {
      overallProgress: 100,
      referralsProgress: 100,
      socialPostsProgress: 100,
      referralsComplete: true,
      socialPostsComplete: true
    };
  }

  const referralsProgress = nextTier.requirements.referrals > 0 
    ? Math.min(100, (profile.total_referrals / nextTier.requirements.referrals) * 100)
    : 100;
    
  const socialPostsProgress = nextTier.requirements.socialPosts > 0
    ? Math.min(100, (profile.social_posts_this_month / nextTier.requirements.socialPosts) * 100)
    : 100;

  const referralsComplete = profile.total_referrals >= nextTier.requirements.referrals;
  const socialPostsComplete = profile.social_posts_this_month >= nextTier.requirements.socialPosts;

  const overallProgress = (referralsProgress + socialPostsProgress) / 2;

  return {
    overallProgress,
    referralsProgress,
    socialPostsProgress,
    referralsComplete,
    socialPostsComplete
  };
};
