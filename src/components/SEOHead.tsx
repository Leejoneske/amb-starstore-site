import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  noIndex?: boolean;
}

// Page-specific SEO metadata
const pageSEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'StarStore Ambassador Program - Earn Commissions in Digital Commerce',
    description: 'Join the premier ambassador program for digital commerce. Earn up to 25% commission, unlock exclusive rewards, and grow with StarStore. Apply today!',
  },
  '/apply': {
    title: 'Apply to Become an Ambassador - StarStore',
    description: 'Apply to join the StarStore Ambassador Program. Earn commissions by referring users, access exclusive perks, and be part of our growing community.',
  },
  '/auth': {
    title: 'Sign In - StarStore Ambassador Portal',
    description: 'Sign in to your StarStore Ambassador dashboard. Track your earnings, manage referrals, and access exclusive ambassador tools.',
  },
  '/dashboard': {
    title: 'Ambassador Dashboard - StarStore',
    description: 'Your StarStore Ambassador dashboard. View your earnings, track referrals, and manage your ambassador account.',
  },
  '/admin': {
    title: 'Admin Dashboard - StarStore',
    description: 'StarStore administration panel for managing ambassadors, applications, and platform analytics.',
  },
  '/onboarding': {
    title: 'Get Started - StarStore Ambassador',
    description: 'Complete your StarStore ambassador onboarding. Connect your Telegram and get your referral tools.',
  },
  '/reset-password': {
    title: 'Reset Password - StarStore',
    description: 'Reset your StarStore account password securely.',
  },
};

export const SEOHead = ({ 
  title: customTitle, 
  description: customDescription,
  keywords = 'ambassador program, referral program, earn commissions, digital commerce, telegram stars, cryptocurrency',
  image = '/favicon.ico',
  noIndex = false 
}: SEOHeadProps) => {
  const location = useLocation();
  
  // Get page-specific SEO or use defaults
  const pageMeta = pageSEO[location.pathname] || {
    title: 'StarStore - Ambassador Program',
    description: 'Join the StarStore Ambassador Program and start earning commissions today.',
  };
  
  const title = customTitle || pageMeta.title;
  const description = customDescription || pageMeta.description;
  const fullTitle = title.includes('StarStore') ? title : `${title} | StarStore`;
  
  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', fullTitle);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'StarStore');
    
    // Update Twitter tags
    updateMetaTag('twitter:card', 'summary');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Handle noindex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noIndex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.setAttribute('content', 'index, follow');
    }
    
    // Cleanup function
    return () => {
      // Reset title on unmount if needed
    };
  }, [fullTitle, description, keywords, image, noIndex]);
  
  return null; // This component doesn't render anything
};

// Helper function to update or create meta tags
function updateMetaTag(property: string, content: string) {
  const isOG = property.startsWith('og:');
  const isTwitter = property.startsWith('twitter:');
  const attrName = isOG || isTwitter ? 'property' : 'name';
  
  let meta = document.querySelector(`meta[${attrName}="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attrName, property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

export default SEOHead;
