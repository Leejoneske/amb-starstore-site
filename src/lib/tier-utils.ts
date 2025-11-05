export interface TierInfo {
  name: string;
  displayName: string;
  color: string;
  gradient: string;
  icon: string;
  requirements: {
    referrals: number;
    transactions: number;
    socialPosts: number;
    avgStars: number;
    qualityRate: number;
  };
  benefits: {
    minEarnings: number;
    nftLevel: number;
    freeStars: number;
    commissionRate: number;
    extras?: string[];
  };
}

export interface TierConfig {
  tier: string;
  displayName: string;
  icon: string;
  requirements: {
    referrals: number;
    socialPosts: number;
    qualityRate: number;
  };
  benefits: {
    minEarnings: number;
    nftLevel: number;
    freeStars: number;
    commissionRate: number;
  };
}

export const TIER_INFO: Record<string, TierInfo> = {
  explorer: {
    name: 'explorer',
    displayName: 'Explorer',
    color: '#A78BFA',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
    icon: '🧭',
    requirements: {
      referrals: 10,
      transactions: 30,
      socialPosts: 4,
      avgStars: 350,
      qualityRate: 0.7
    },
    benefits: {
      minEarnings: 30,
      nftLevel: 1,
      freeStars: 50,
      commissionRate: 5,
      extras: ['Access to ambassador group', 'Basic analytics dashboard']
    }
  },
  pioneer: {
    name: 'pioneer',
    displayName: 'Pioneer',
    color: '#60A5FA',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
    icon: '🚀',
    requirements: {
      referrals: 25,
      transactions: 70,
      socialPosts: 8,
      avgStars: 450,
      qualityRate: 0.75
    },
    benefits: {
      minEarnings: 80,
      nftLevel: 3,
      freeStars: 150,
      commissionRate: 7,
      extras: ['Priority support', 'Co-marketing opportunities']
    }
  },
  trailblazer: {
    name: 'trailblazer',
    displayName: 'Trailblazer',
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
    icon: '⚡',
    requirements: {
      referrals: 50,
      transactions: 100,
      socialPosts: 12,
      avgStars: 500,
      qualityRate: 0.8
    },
    benefits: {
      minEarnings: 150,
      nftLevel: 4,
      freeStars: 250,
      commissionRate: 10,
      extras: ['Advanced analytics', 'Custom referral tools']
    }
  },
  legend: {
    name: 'legend',
    displayName: 'Legend',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    icon: '👑',
    requirements: {
      referrals: 100,
      transactions: 200,
      socialPosts: 15,
      avgStars: 600,
      qualityRate: 0.85
    },
    benefits: {
      minEarnings: 300,
      nftLevel: 5,
      freeStars: 500,
      commissionRate: 15,
      extras: ['Revenue share participation', 'Lead monthly community events', 'VIP support']
    }
  }
};

export const TIER_CONFIGS: Record<string, TierConfig> = {
  explorer: {
    tier: 'explorer',
    displayName: 'Explorer',
    icon: '🧭',
    requirements: {
      referrals: 10,
      socialPosts: 4,
      qualityRate: 0.7
    },
    benefits: {
      minEarnings: 30,
      nftLevel: 1,
      freeStars: 50,
      commissionRate: 5
    }
  },
  pioneer: {
    tier: 'pioneer',
    displayName: 'Pioneer',
    icon: '🚀',
    requirements: {
      referrals: 25,
      socialPosts: 8,
      qualityRate: 0.75
    },
    benefits: {
      minEarnings: 80,
      nftLevel: 3,
      freeStars: 150,
      commissionRate: 7
    }
  },
  trailblazer: {
    tier: 'trailblazer',
    displayName: 'Trailblazer',
    icon: '⚡',
    requirements: {
      referrals: 50,
      socialPosts: 12,
      qualityRate: 0.8
    },
    benefits: {
      minEarnings: 150,
      nftLevel: 4,
      freeStars: 250,
      commissionRate: 10
    }
  },
  legend: {
    tier: 'legend',
    displayName: 'Legend',
    icon: '👑',
    requirements: {
      referrals: 100,
      socialPosts: 15,
      qualityRate: 0.85
    },
    benefits: {
      minEarnings: 300,
      nftLevel: 5,
      freeStars: 500,
      commissionRate: 15
    }
  }
};

export const getTierInfo = (tier: string): TierInfo => {
  // Map old tier names to new ones
  const tierMap: Record<string, string> = {
    'entry': 'explorer',
    'growing': 'pioneer',
    'advanced': 'trailblazer',
    'elite': 'legend'
  };
  
  const mappedTier = tierMap[tier] || tier;
  return TIER_INFO[mappedTier] || TIER_INFO.explorer;
};

export const getTierConfig = (tier: string): TierConfig => {
  // Map old tier names to new ones
  const tierMap: Record<string, string> = {
    'entry': 'explorer',
    'growing': 'pioneer',
    'advanced': 'trailblazer',
    'elite': 'legend'
  };
  
  const mappedTier = tierMap[tier] || tier;
  return TIER_CONFIGS[mappedTier] || TIER_CONFIGS.explorer;
};

export const getNextTier = (currentTier: string): TierConfig | null => {
  // Map old tier names to new ones
  const tierMap: Record<string, string> = {
    'entry': 'explorer',
    'growing': 'pioneer',
    'advanced': 'trailblazer',
    'elite': 'legend'
  };
  
  const mappedTier = tierMap[currentTier] || currentTier;
  const tiers = ['explorer', 'pioneer', 'trailblazer', 'legend'];
  const currentIndex = tiers.indexOf(mappedTier);
  const nextTierName = tiers[currentIndex + 1];
  return nextTierName ? TIER_CONFIGS[nextTierName] : null;
};

export const getTierBadgeClass = (tier: string): string => {
  return `level-${tier}`;
};

export const calculateTierProgress = (profile: any): {
  overallProgress: number;
  referralsComplete: boolean;
  socialPostsComplete: boolean;
  qualityRateComplete: boolean;
} => {
  const nextTier = getNextTier(profile.current_tier);
  
  if (!nextTier) {
    return {
      overallProgress: 100,
      referralsComplete: true,
      socialPostsComplete: true,
      qualityRateComplete: true
    };
  }

  const referralsProgress = Math.min(100, (profile.total_referrals / nextTier.requirements.referrals) * 100);
  const socialPostsProgress = Math.min(100, (profile.social_posts_this_month / nextTier.requirements.socialPosts) * 100);
  const qualityRateProgress = Math.min(100, ((profile.quality_transaction_rate || 0) / nextTier.requirements.qualityRate) * 100);

  const referralsComplete = profile.total_referrals >= nextTier.requirements.referrals;
  const socialPostsComplete = profile.social_posts_this_month >= nextTier.requirements.socialPosts;
  const qualityRateComplete = (profile.quality_transaction_rate || 0) >= nextTier.requirements.qualityRate;

  const overallProgress = (referralsProgress + socialPostsProgress + qualityRateProgress) / 3;

  return {
    overallProgress,
    referralsComplete,
    socialPostsComplete,
    qualityRateComplete
  };
};