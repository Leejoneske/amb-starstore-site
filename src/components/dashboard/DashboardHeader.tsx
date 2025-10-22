import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import type { User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User;
  tier: string;
  isAdmin: boolean;
}

export const DashboardHeader = ({ user, tier, isAdmin }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <ProfileSection 
          user={user} 
          tier={tier}
          isAdmin={isAdmin}
        />
      </div>
      <div className="flex items-center gap-3">
        <NotificationCenter userId={user?.id} isAdmin={isAdmin} />
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Live Dashboard
        </Badge>
      </div>
    </div>
  );
};