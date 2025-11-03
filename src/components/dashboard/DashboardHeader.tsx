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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <ProfileSection 
        user={user} 
        tier={tier}
        isAdmin={isAdmin}
      />
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <NotificationCenter userId={user?.id} isAdmin={isAdmin} />
        <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-1">
          <Activity className="h-3 w-3" />
          <span className="hidden sm:inline">Live Dashboard</span>
        </Badge>
      </div>
    </div>
  );
};