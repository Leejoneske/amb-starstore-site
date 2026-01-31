import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Skip link for keyboard navigation accessibility.
 * Allows keyboard users to skip to main content.
 */
export const SkipLink = ({ 
  href = '#main-content', 
  children = 'Skip to main content',
  className 
}: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={cn(
        // Visually hidden by default
        'sr-only',
        // Show on focus
        'focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]',
        'focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </a>
  );
};

export default SkipLink;
