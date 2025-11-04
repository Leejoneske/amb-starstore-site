import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import type { User } from '@supabase/supabase-js';
import { Card } from "@/components/ui/card";

interface DashboardHeaderProps {
  user: User;
  tier: string;
  isAdmin: boolean;
}

export const DashboardHeader = ({ user, tier, isAdmin }: DashboardHeaderProps) => {
  return (
    <Card className="p-4 border-border/50 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <ProfileSection 
          user={user} 
          tier={tier}
          isAdmin={isAdmin}
        />
        <NotificationCenter userId={user?.id} isAdmin={isAdmin} />
      </div>
    </Card>
  );
};