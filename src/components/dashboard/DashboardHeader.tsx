import type { User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User;
  tier: string;
  isAdmin: boolean;
}

export const DashboardHeader = ({ user, tier, isAdmin }: DashboardHeaderProps) => {
  return (
    <div className="pb-6 border-b border-border">
      <h1 className="text-2xl sm:text-3xl font-bold font-serif bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
        Ambassador Dashboard
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground mt-1">
        Track your performance and grow your network
      </p>
    </div>
  );
};