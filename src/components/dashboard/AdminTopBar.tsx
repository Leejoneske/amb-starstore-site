import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, LogOut, Activity } from "lucide-react";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AdminTopBarProps {
  userId?: string;
  title: string;
  onRefresh?: () => void;
  onExport?: () => void;
}

export const AdminTopBar = ({ userId, title, onRefresh, onExport }: AdminTopBarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        )}
        
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="bg-success/10 hover:bg-success/20 text-success border-success/20">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        )}
        
        <NotificationCenter userId={userId} isAdmin={true} />
        
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        
        <Badge variant="destructive" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Admin Access
        </Badge>
      </div>
    </div>
  );
};
