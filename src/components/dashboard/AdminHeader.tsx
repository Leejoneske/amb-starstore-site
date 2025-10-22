import { Badge } from "@/components/ui/badge";
import { Shield, Activity } from "lucide-react";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";

interface AdminHeaderProps {
  userId?: string;
}

export const AdminHeader = ({ userId }: AdminHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive system management and analytics</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationCenter userId={userId} isAdmin={true} />
        <Badge variant="destructive" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Admin Access
        </Badge>
      </div>
    </div>
  );
};