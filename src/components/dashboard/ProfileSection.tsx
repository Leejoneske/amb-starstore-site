import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@supabase/supabase-js";

interface ProfileSectionProps {
  user: User;
  tier: string;
  isAdmin?: boolean;
}

export const ProfileSection = ({ user, tier, isAdmin }: ProfileSectionProps) => {
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
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold">{fullName}</h2>
            {isAdmin && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                Admin
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
          <Badge className={getTierColor(tier)}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Ambassador
          </Badge>
        </div>
      </div>
    </Card>
  );
};
