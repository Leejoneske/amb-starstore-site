import { BarChart3, FileText, Users, TrendingUp, Settings, Database, Mail, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "ambassadors", label: "All Ambassadors", icon: Users },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "starstore", label: "Star Store Data", icon: Database },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

export const AdminSidebar = ({ activeView, onViewChange }: AdminSidebarProps) => {
  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Ambassador Admin</h2>
              <p className="text-xs text-muted-foreground">Management Portal</p>
            </div>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 hover:bg-muted/50",
                      activeView === item.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
