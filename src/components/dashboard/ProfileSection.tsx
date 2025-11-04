import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PasswordChangeDialog } from "@/components/dashboard/PasswordChangeDialog";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileSectionProps {
  user: User;
  tier: string;
  isAdmin?: boolean;
}

export const ProfileSection = ({ user, tier, isAdmin }: ProfileSectionProps) => {
  // Check if user needs to change password
  const { data: ambassadorProfile } = useQuery({
    queryKey: ['ambassador-profile-password', user.id],
    queryFn: async () => {
      if (isAdmin) return null;
      const { data } = await supabase
        .from('ambassador_profiles')
        .select('password_change_required')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !isAdmin && !!user.id,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'bg-primary/10 text-primary border-primary/20';
      case 'advanced': return 'bg-primary/10 text-primary border-primary/20';
      case 'growing': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
          <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{fullName}</h2>
            {isAdmin && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                Admin
              </Badge>
            )}
            {ambassadorProfile?.password_change_required && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                Temp Password
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className={`${getTierColor(tier)} text-xs`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
      {!isAdmin && (
        <PasswordChangeDialog 
          isUsingTempPassword={ambassadorProfile?.password_change_required || false}
        />
      )}
    </div>
  );
};
