import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { useUserRole } from "@/hooks/useUserRole";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const location = useLocation();
  const { data: userRole } = useUserRole(user?.id);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  // Only show navbar for authenticated users on dashboard
  const isAppRoute = location.pathname.startsWith('/dashboard');

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <img 
              src="/favicon.ico" 
              alt="StarStore" 
              className="w-5 h-5 group-hover:opacity-80 transition-opacity"
            />
            <div className="text-lg font-semibold">StarStore</div>
          </Link>
          <div className="flex items-center gap-3">
            {isAppRoute && user && (
              <>
                <NotificationCenter userId={user.id} isAdmin={userRole === 'admin'} />
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </>
            )}
            {user ? (
              <>
                {!isAppRoute && <Link to="/dashboard"><Button variant="default" size="sm">Dashboard</Button></Link>}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/apply"><Button variant="default" size="sm">Apply</Button></Link>
                <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
