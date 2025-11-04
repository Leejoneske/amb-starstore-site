import { Home, Users, TrendingUp, Award, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SideNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "home", label: "Overview", icon: Home },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "tiers", label: "Tiers", icon: Crown },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "goals", label: "Goals", icon: Award },
  { id: "actions", label: "Actions", icon: Zap },
];

export const SideNav = ({ activeView, onViewChange }: SideNavProps) => {
  return (
    <div className="hidden lg:flex flex-col w-64 gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all font-medium text-sm",
              isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
