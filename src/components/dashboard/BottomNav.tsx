import { Home, Users, TrendingUp, Award, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "tiers", label: "Tiers", icon: Crown },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "actions", label: "Actions", icon: Zap },
];

export const BottomNav = ({ activeView, onViewChange }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-lg lg:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-7xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "rounded-lg p-2 transition-all",
                isActive && "bg-primary/10"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-xs",
                isActive ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
