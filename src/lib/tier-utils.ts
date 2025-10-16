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
  };
  benefits: {
    minEarnings: number;
    nftLevel: number;
    freeStars: number;
    extras?: string[];
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
      referrals: 30,
      transactions: 30,
      socialPosts: 4,
      avgStars: 350
    },
    benefits: {
      minEarnings: 30,
      nftLevel: 1,
      freeStars: 50,
      extras: ['Access to ambassador group', 'Basic analytics dashboard']
    }
  },
  connector: {
    name: 'connector',
    displayName: 'Connector',
    color: '#34D399',
    gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    icon: '🤝',
    requirements: {
      referrals: 50,
      transactions: 50,
      socialPosts: 6,
      avgStars: 400
    },
    benefits: {
      minEarnings: 60,
      nftLevel: 2,
      freeStars: 100
    }
  },
  pioneer: {
    name: 'pioneer',
    displayName: 'Pioneer',
    color: '#60A5FA',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
    icon: '🚀',
    requirements: {
      referrals: 70,
      transactions: 70,
      socialPosts: 8,
      avgStars: 450
    },
    benefits: {
      minEarnings: 80,
      nftLevel: 3,
      freeStars: 150,
      extras: ['Priority support', 'Co-marketing opportunities']
    }
  },
  elite: {
    name: 'elite',
    displayName: 'Elite',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    icon: '🏆',
    requirements: {
      referrals: 100,
      transactions: 100,
      socialPosts: 10,
      avgStars: 500
    },
    benefits: {
      minEarnings: 110,
      nftLevel: 4,
      freeStars: 200,
      extras: ['Revenue share participation', 'Lead monthly community events']
    }
  }
};

export const getTierInfo = (tier: string): TierInfo => {
  return TIER_INFO[tier] || TIER_INFO.explorer;
};

export const getNextTier = (currentTier: string): TierInfo | null => {
  const tiers = ['explorer', 'connector', 'pioneer', 'elite'];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTierName = tiers[currentIndex + 1];
  return nextTierName ? TIER_INFO[nextTierName] : null;
};

export const getTierBadgeClass = (tier: string): string => {
  return `level-${tier}`;
};