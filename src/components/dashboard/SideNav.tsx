import { Home, Users, TrendingUp, Award, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface SideNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "tiers", label: "Tiers", icon: Crown },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "goals", label: "Goals", icon: Award },
  { id: "actions", label: "Actions", icon: Zap },
];

export const SideNav = ({ activeView, onViewChange }: SideNavProps) => {
  return (
    <Card className="hidden md:block w-64 p-4 h-fit sticky top-6">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </Card>
  );
};
