import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PasswordChangeDialog } from "@/components/dashboard/PasswordChangeDialog";
import { User } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User as UserIcon, Mail, Shield, Key, Bell, Database, Settings as SettingsIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface SettingsProps {
  user: User;
  tier: string;
  isAdmin?: boolean;
}

export const Settings = ({ user, tier, isAdmin }: SettingsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);

  const { data: ambassadorProfile } = useQuery({
    queryKey: ['ambassador-profile-password', user.id],
    queryFn: async () => {
      if (isAdmin) return null;
      const { data } = await supabase
        .from('ambassador_profiles')
        .select('password_change_required, telegram_username')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !isAdmin && !!user.id,
  });

  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      if (!isAdmin) return null;
      
      const [applicationsRes, ambassadorsRes] = await Promise.all([
        supabase.from('applications').select('id', { count: 'exact', head: true }),
        supabase.from('ambassador_profiles').select('id', { count: 'exact', head: true })
      ]);
      
      return {
        totalApplications: applicationsRes.count || 0,
        totalAmbassadors: ambassadorsRes.count || 0
      };
    },
    enabled: isAdmin
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-serif">Account Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">{fullName}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`${getTierColor(tier)}`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
              </Badge>
              {isAdmin && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  Admin
                </Badge>
              )}
              {ambassadorProfile?.password_change_required && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  Temp Password - Change Required
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Email Address</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {ambassadorProfile?.telegram_username && (
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Telegram Username</p>
                <p className="text-sm text-muted-foreground">@{ambassadorProfile.telegram_username}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Account Type</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? 'Administrator Account' : 'Ambassador Account'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Admin Settings */}
      {isAdmin && (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Admin Preferences</h3>
                <p className="text-sm text-muted-foreground">Configure your admin dashboard settings</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for new applications and important events
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-approval" className="text-base">Auto-approve Applications</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve applications that meet all criteria
                  </p>
                </div>
                <Switch
                  id="auto-approval"
                  checked={autoApproval}
                  onCheckedChange={setAutoApproval}
                  disabled
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">System Overview</h3>
                <p className="text-sm text-muted-foreground">Quick stats about your ambassador program</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-sm font-medium text-muted-foreground mb-1">Total Applications</div>
                <div className="text-2xl font-bold text-primary">{adminStats?.totalApplications || 0}</div>
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="text-sm font-medium text-muted-foreground mb-1">Active Ambassadors</div>
                <div className="text-2xl font-bold text-success">{adminStats?.totalAmbassadors || 0}</div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Security Settings */}
      {!isAdmin && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">Manage your password and security settings</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  {ambassadorProfile?.password_change_required 
                    ? 'You are using a temporary password. Please change it for security.' 
                    : 'Keep your account secure with a strong password'}
                </p>
              </div>
              <PasswordChangeDialog 
                isUsingTempPassword={ambassadorProfile?.password_change_required || false}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};