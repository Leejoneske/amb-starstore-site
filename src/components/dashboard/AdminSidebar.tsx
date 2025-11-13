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
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "ambassadors", label: "Ambassadors", icon: Users },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "starstore", label: "Star Store", icon: Database },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

export const AdminSidebar = ({ activeView, onViewChange }: AdminSidebarProps) => {
  const { setOpenMobile } = useSidebar();

  const handleNavigation = (viewId: string) => {
    onViewChange(viewId);
    setOpenMobile(false); // Close mobile menu after selection
  };

  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarContent className="bg-background">
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-destructive/10 backdrop-blur-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-destructive flex items-center justify-center shadow-lg">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">Ambassador Admin</h2>
              <p className="text-xs text-muted-foreground">Management Portal</p>
            </div>
          </div>
        </div>
        
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-foreground",
                      activeView === item.id && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
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
