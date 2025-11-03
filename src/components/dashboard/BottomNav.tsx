import { Home, Users, TrendingUp, Award, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "goals", label: "Goals", icon: Award },
  { id: "actions", label: "Actions", icon: Zap },
];

export const BottomNav = ({ activeView, onViewChange }: BottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className={cn(
                "text-xs font-medium",
                isActive && "font-semibold"
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
