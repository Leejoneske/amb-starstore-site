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
    <div className="sticky top-0 z-10 h-14 md:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger />
        <h1 className="text-base md:text-xl font-bold truncate max-w-[150px] md:max-w-none">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} className="hidden md:flex">
            <RefreshCw className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Refresh</span>
          </Button>
        )}
        
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="hidden sm:flex bg-success/10 hover:bg-success/20 text-success border-success/20">
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Export</span>
          </Button>
        )}
        
        <NotificationCenter userId={userId} isAdmin={true} />
        
        <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4 md:mr-2" />
          <span className="hidden lg:inline">Logout</span>
        </Button>
        
        <Badge variant="destructive" className="hidden md:flex items-center gap-1">
          <Activity className="h-3 w-3" />
          <span className="hidden lg:inline">Admin</span>
        </Badge>
      </div>
    </div>
  );
};
